namespace DrivePulse.Api.Domain;

public record MileageResult(decimal CurrentKm, int ProjectedKm, int AllowanceKm, int ExcessKm,
    decimal EstimatedExcessCost, decimal DailyAverageKm, int RemainingDays, decimal SafeDailyKm);

public static class MileageCalculator
{
    public static MileageResult Calculate(decimal currentKm, int allowanceKm, decimal excessPrice, DateOnly date)
    {
        if (currentKm < 0 || allowanceKm < 0 || excessPrice < 0) throw new ArgumentOutOfRangeException(nameof(currentKm));
        var days = DateTime.DaysInMonth(date.Year, date.Month);
        var projected = (int)Math.Round(currentKm / date.Day * days, MidpointRounding.AwayFromZero);
        var excess = Math.Max(0, projected - allowanceKm);
        var remaining = days - date.Day;
        return new(currentKm, projected, allowanceKm, excess, Math.Round(excess * excessPrice, 2),
            Math.Round(currentKm / date.Day, 2), remaining,
            remaining == 0 ? 0 : Math.Round(Math.Max(0, allowanceKm - currentKm) / remaining, 2));
    }
}

public record Recommendation(string Id, string Type, string Title, string Description, string Reason,
    int Priority, string CtaLabel, decimal? EstimatedValue);

public interface IRecommendationProvider
{
    Recommendation? Recommend(IEnumerable<Alert> alerts, MileageResult mileage, IReadOnlyCollection<string> handledIds, DateOnly referenceDate);
}

public sealed class RuleBasedRecommendationProvider : IRecommendationProvider
{
    public Recommendation? Recommend(IEnumerable<Alert> alerts, MileageResult mileage, IReadOnlyCollection<string> handledIds, DateOnly referenceDate)
    {
        var pending = alerts.Where(a => a.Status == "pending" && !handledIds.Contains(a.Id)).ToList();
        var critical = pending.Where(a => a.Type == "maintenance" && a.Severity == "critical" && a.DueDate <= referenceDate)
            .OrderBy(a => a.DueDate).FirstOrDefault();
        if (critical is not null) return new(critical.Id, critical.ActionType, "Seu carro precisa de atenção", critical.Description,
            "A revisão vencida tem prioridade para manter seu carro em dia.", 100, "Agendar revisão", 0);
        if (mileage.ExcessKm > 0 && !handledIds.Contains("mileage-plan"))
            return new("mileage-plan", "mileage-plan", "Vamos cuidar da sua franquia?",
                $"Seu ritmo atual projeta {mileage.ProjectedKm.ToString("N0", System.Globalization.CultureInfo.GetCultureInfo("pt-BR"))} km neste mês. Um plano de uso pode ajudar a reduzir o excedente.",
                "A projeção considera seu uso acumulado e os dias do mês; não é uma cobrança confirmada.", 80, "Criar plano de uso", mileage.EstimatedExcessCost);
        var document = pending.Where(a => a.Type == "document" && a.DueDate <= referenceDate.AddDays(30))
            .OrderBy(a => a.DueDate).FirstOrDefault();
        return document is null ? null : new(document.Id, document.ActionType, "Seu documento merece uma conferida", document.Description,
            "Conferir os dados agora ajuda você a se organizar antes do vencimento.", 60, "Conferir documento", null);
    }
}

public sealed class Alert
{
    [System.Text.Json.Serialization.JsonIgnore] public string SubscriptionId { get; set; } = "subscription-marina";
    public string Id { get; set; } = "";
    public string Type { get; set; } = "";
    public string Severity { get; set; } = "info";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public DateOnly DueDate { get; set; }
    public string Status { get; set; } = "pending";
    public string ActionType { get; set; } = "";
}

