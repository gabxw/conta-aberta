using System.Globalization;
using DrivePulse.Api.Data;
using DrivePulse.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace DrivePulse.Api.Features;

public sealed class ActionValidationException(string message) : Exception(message);

public sealed class ActionService(DrivePulseDb db, DashboardService dashboard, IReferenceClock clock)
{
    private static readonly HashSet<string> Types = ["mileage-plan", "schedule-maintenance", "review-document", "dismiss-recommendation", "contract-interest"];
    public async Task<ActionResponse> Execute(ActionRequest request, CancellationToken ct)
    {
        if (request.Type is null || !Types.Contains(request.Type)) throw new ActionValidationException("Escolha um tipo de ação válido.");
        if (request.TargetId?.Length > 100) throw new ActionValidationException("O identificador da ação deve ter até 100 caracteres.");
        DateOnly? date = null;
        if (request.Type == "schedule-maintenance")
        {
            if (!DateOnly.TryParseExact(request.ScheduledDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed) || parsed < clock.Today)
                throw new ActionValidationException("Escolha uma data ISO válida a partir da data de referência.");
            date = parsed;
        }
        else if (request.ScheduledDate is not null)
            throw new ActionValidationException("A data de agendamento só se aplica à manutenção.");
        // A transaction-scoped PostgreSQL advisory lock serializes this demo customer's clicks across API instances.
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(20261020)", ct);
        string target;
        Alert? alert = null;
        if (request.Type == "contract-interest")
        {
            if (request.TargetId is not ("renew" or "plan-1000" or "plan-2000" or "buy"))
                throw new ActionValidationException("Escolha uma opção de contrato válida.");
            target = request.TargetId;
        }
        else if (request.Type == "mileage-plan")
        {
            if (request.TargetId is not null && request.TargetId is not "mileage-plan" and not "mileage-october")
                throw new ActionValidationException("O plano de uso informado não existe.");
            target = "mileage-plan";
        }
        else if (request.Type == "dismiss-recommendation")
        {
            target = request.TargetId ?? (await dashboard.GetDashboard(ct)).NextBestAction?.Id ?? throw new ActionValidationException("Não há recomendação disponível para dispensar.");
            if (target != "mileage-plan" && !await db.Alerts.AnyAsync(x => x.Id == target, ct))
                throw new ActionValidationException("A recomendação informada não existe.");
        }
        else
        {
            alert = request.TargetId is null
                ? await db.Alerts.Where(x => x.ActionType == request.Type).OrderBy(x => x.DueDate).FirstOrDefaultAsync(ct)
                : await db.Alerts.SingleOrDefaultAsync(x => x.Id == request.TargetId && x.ActionType == request.Type, ct);
            if (alert is null) throw new ActionValidationException("A ação não corresponde a um alerta existente.");
            target = alert.Id;
        }
        var existing = await db.Actions.SingleOrDefaultAsync(x => x.Type == request.Type && x.TargetId == target, ct);
        if (existing is not null)
        {
            await transaction.CommitAsync(ct);
            return new(existing.Message, existing.EventId);
        }
        if (request.Type == "mileage-plan")
        {
            var current = await dashboard.GetDashboard(ct);
            if (current.Mileage.ExcessKm == 0) throw new ActionValidationException("Seu uso não exige um plano de excedente neste momento.");
            alert = await db.Alerts.SingleOrDefaultAsync(x => x.Id == "mileage-october", ct);
        }
        if (request.Type == "dismiss-recommendation")
        {
            if ((await dashboard.GetDashboard(ct)).NextBestAction?.Id != target)
                throw new ActionValidationException("A recomendação já foi tratada ou não está disponível.");
            alert = await db.Alerts.SingleOrDefaultAsync(x => x.Id == (target == "mileage-plan" ? "mileage-october" : target), ct);
        }
        else if (alert is not null && alert.Status != "pending" && alert.Status != "dismissed")
            throw new ActionValidationException("Este alerta já foi tratado.");
        var description = "";
        string title, type, message;
        switch (request.Type)
        {
            case "contract-interest":
                title = "Interesse no próximo contrato registrado"; type = "subscription";
                description = $"Opção: {target}. Registro demonstrativo de interesse; nenhum contrato ou compra foi efetivado.";
                message = "Interesse salvo na demonstração. Seu contrato atual continua vigente.";
                break;
            case "schedule-maintenance":
                title = "Revisão agendada na demonstração"; type = "maintenance";
                description = $"Agendamento de demonstração registrado para {date:dd/MM/yyyy}. Nenhuma reserva foi enviada a uma oficina.";
                message = $"Revisão registrada para {date:dd/MM/yyyy} na demonstração.";
                if (alert is not null) alert.Status = "scheduled";
                break;
            case "review-document":
                title = "CRLV conferido"; type = "document";
                description = "Você confirmou a conferência dos dados do documento de demonstração.";
                message = "Conferência do documento registrada.";
                if (alert is not null) alert.Status = "reviewed";
                break;
            case "mileage-plan":
                var mileage = (await dashboard.GetDashboard(ct)).Mileage;
                title = "Plano de uso ativado"; type = "mileage";
                description = $"Meta de até {mileage.SafeDailyKm.ToString("N2", CultureInfo.GetCultureInfo("pt-BR"))} km por dia nos {mileage.RemainingDays} dias restantes. A projeção seguirá baseada no uso registrado.";
                message = "Plano de uso registrado. Acompanhe sua meta diária no painel.";
                if (alert is not null) alert.Status = "planned";
                break;
            default:
                title = "Recomendação dispensada"; type = "recommendation";
                description = "Sua preferência foi registrada; a próxima recomendação disponível aparecerá no painel.";
                message = "Recomendação dispensada.";
                if (alert is not null) alert.Status = "dismissed";
                break;
        }
        var timeline = new TimelineEvent { Type = type, Title = title, Description = description, OccurredAt = clock.UtcNow, Status = request.Type == "schedule-maintenance" ? "scheduled" : "completed" };
        db.Timeline.Add(timeline);
        db.Actions.Add(new() { Type = request.Type, TargetId = target, ScheduledDate = date, EventId = timeline.Id, Message = message, CreatedAt = clock.UtcNow });
        db.Events.Add(new() { Name = request.Type == "dismiss-recommendation" ? "recommendation_dismissed" : "action_completed", Page = "/", Metadata = $"{request.Type}:{target}", OccurredAt = clock.UtcNow });
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return new(message, timeline.Id);
    }
}

