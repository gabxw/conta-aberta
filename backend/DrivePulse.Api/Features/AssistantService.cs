using System.Text.Json;
using Anthropic;
using Anthropic.Models.Messages;
using DrivePulse.Api.Data;
using DrivePulse.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace DrivePulse.Api.Features;

public record AssistantRequest(string? Question);
public record AssistantToolCall(string Name, string Input, string Result);
public record AssistantAnswer(string Answer, IReadOnlyList<AssistantToolCall> Calculations);
public sealed class AssistantUnavailableException(string message) : Exception(message);

// Agente "Vale a pena?": o modelo interpreta a dúvida e explica; todo número vem do OwnershipCalculator.
public sealed class AssistantService(DrivePulseDb db, IConfiguration configuration, ILogger<AssistantService> logger)
{
    const int MaxTurns = 4;
    const string ToolName = "simular_custos";

    const string SystemPrompt = """
        Você é o assistente da Conta Aberta, um conceito para o app de carro por assinatura.
        Responda dúvidas do assinante sobre quanto custaria ter o mesmo carro comprando à vista ou financiado, em comparação com a assinatura.

        Regras:
        - Todo valor em reais que você citar precisa vir da ferramenta simular_custos. Chame a ferramenta antes de responder qualquer pergunta com número, mesmo que pareça simples.
        - Se o cliente mudar uma premissa (preço, revenda, prazo, entrada, juros), passe só esse campo para a ferramenta; os demais usam os valores padrão do contrato.
        - Responda em português do Brasil, em até 5 frases curtas, sem markdown, sem listas e sem títulos.
        - Diga em uma frase qual premissa mais pesa no resultado.
        - Você não executa ações: renovar, trocar de plano ou comprar só acontece pelo app, com confirmação do cliente. Se pedirem isso, explique e não prometa nada.
        - Se a pergunta não for sobre custos do carro ou da assinatura, diga que só ajuda com essa comparação.
        """;

    static readonly Tool CostTool = new()
    {
        Name = ToolName,
        Description = "Calcula o custo mensal equivalente de ter o carro do contrato (à vista e financiado) e compara com a mensalidade da assinatura. Campos omitidos usam os valores padrão do contrato: preço FIPE R$ 143.276, revenda R$ 107.163 em 24 meses, entrada de 20% e juros de 1,99% ao mês.",
        InputSchema = new()
        {
            Properties = new Dictionary<string, JsonElement>
            {
                ["preco_carro"] = Schema("number", "Preço de compra do carro em reais."),
                ["revenda"] = Schema("number", "Valor de revenda esperado no fim do prazo, em reais."),
                ["prazo_meses"] = Schema("integer", "Prazo da comparação em meses, de 12 a 60."),
                ["entrada_percentual"] = Schema("number", "Entrada do financiamento, em % do preço."),
                ["juros_mensal_percentual"] = Schema("number", "Juros do financiamento, em % ao mês."),
            },
        },
    };

    public async Task<AssistantAnswer> Ask(AssistantRequest request, CancellationToken ct)
    {
        var question = request.Question?.Trim();
        if (string.IsNullOrEmpty(question) || question.Length > 500)
            throw new ArgumentException("Escreva uma pergunta de até 500 caracteres.");
        var apiKey = configuration["ANTHROPIC_API_KEY"];
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new AssistantUnavailableException("O assistente de IA não está configurado nesta demonstração.");

        var price = (await db.Subscriptions.AsNoTracking().SingleAsync(ct)).MonthlyPrice;
        var client = new AnthropicClient { ApiKey = apiKey };
        List<MessageParam> messages = [new() { Role = Role.User, Content = question }];
        var calculations = new List<AssistantToolCall>();

        for (var turn = 0; turn < MaxTurns; turn++)
        {
            var response = await client.Messages.Create(new MessageCreateParams
            {
                Model = "claude-opus-5-5",
                MaxTokens = 4096,
                System = SystemPrompt,
                Tools = [CostTool],
                Messages = messages,
            }, ct);

            if (response.StopReason == StopReason.Refusal)
                return new("Não consigo responder essa pergunta. Posso ajudar a comparar o custo de ter o carro com a assinatura.", calculations);

            List<ContentBlockParam> assistantContent = [];
            List<ContentBlockParam> toolResults = [];
            var text = new List<string>();
            foreach (var block in response.Content)
            {
                if (block.TryPickText(out TextBlock? t))
                {
                    text.Add(t.Text);
                    assistantContent.Add(new TextBlockParam { Text = t.Text });
                }
                else if (block.TryPickThinking(out ThinkingBlock? thinking))
                    assistantContent.Add(new ThinkingBlockParam { Thinking = thinking.Thinking, Signature = thinking.Signature });
                else if (block.TryPickRedactedThinking(out RedactedThinkingBlock? redacted))
                    assistantContent.Add(new RedactedThinkingBlockParam { Data = redacted.Data });
                else if (block.TryPickToolUse(out ToolUseBlock? toolUse))
                {
                    assistantContent.Add(new ToolUseBlockParam { ID = toolUse.ID, Name = toolUse.Name, Input = toolUse.Input });
                    var input = JsonSerializer.Serialize(toolUse.Input);
                    var (result, isError) = RunTool(toolUse.Name, input, price);
                    calculations.Add(new(toolUse.Name, input, result));
                    toolResults.Add(new ToolResultBlockParam { ToolUseID = toolUse.ID, Content = result, IsError = isError });
                }
            }

            if (toolResults.Count == 0)
                return new(string.Join("\n", text).Trim(), calculations);

            messages = [.. messages, new() { Role = Role.Assistant, Content = assistantContent }, new() { Role = Role.User, Content = toolResults }];
        }
        logger.LogWarning("Assistente atingiu o limite de {Turns} turnos.", MaxTurns);
        return new("Não consegui concluir a conta agora. Tente perguntar de outro jeito.", calculations);
    }

    public static (string Result, bool IsError) RunTool(string name, string input, decimal subscriptionPrice)
    {
        if (name != ToolName) return ($"Ferramenta desconhecida: {name}.", true);
        try
        {
            using var doc = JsonDocument.Parse(input);
            var root = doc.RootElement;
            decimal? Num(string field) => root.TryGetProperty(field, out var v) && v.ValueKind == JsonValueKind.Number ? v.GetDecimal() : null;
            var d = OwnershipInputs.Demo;
            var inputs = d with
            {
                VehiclePrice = Num("preco_carro") ?? d.VehiclePrice,
                ResaleValue = Num("revenda") ?? d.ResaleValue,
                Months = (int?)Num("prazo_meses") ?? d.Months,
                DownPaymentPercent = Num("entrada_percentual") ?? d.DownPaymentPercent,
                InterestMonthlyPercent = Num("juros_mensal_percentual") ?? d.InterestMonthlyPercent,
            };
            var c = OwnershipCalculator.Calculate(inputs, subscriptionPrice);
            return (JsonSerializer.Serialize(new
            {
                premissas = new { preco_carro = inputs.VehiclePrice, revenda = inputs.ResaleValue, prazo_meses = inputs.Months, entrada_percentual = inputs.DownPaymentPercent, juros_mensal_percentual = inputs.InterestMonthlyPercent, rendimento_mensal_percentual = inputs.YieldMonthlyPercent },
                mensalidade_assinatura = c.SubscriptionMonthly,
                custo_mensal_a_vista = c.CashMonthly,
                custo_mensal_financiado = c.FinancedMonthly,
                parcela_financiamento = c.Installment,
                diferenca_a_vista_menos_assinatura = c.CashDifference,
                diferenca_financiado_menos_assinatura = c.FinancedDifference,
                composicao_a_vista = c.CashBreakdown.Select(p => new { p.Name, p.MonthlyValue }),
            }), false);
        }
        catch (Exception e) when (e is ArgumentException or JsonException or InvalidOperationException)
        {
            return ($"Premissas inválidas: {e.Message}", true);
        }
    }

    static JsonElement Schema(string type, string description) =>
        JsonSerializer.SerializeToElement(new { type, description });
}
