using DrivePulse.Api.Data;
using DrivePulse.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace DrivePulse.Api.Features;

public record MileagePoint(DateOnly Date, decimal ActualKm, decimal ProjectedKm);
public record MileageDto(decimal CurrentKm, int ProjectedKm, int AllowanceKm, int ExcessKm, decimal EstimatedExcessCost,
    decimal DailyAverageKm, int RemainingDays, decimal SafeDailyKm, IReadOnlyList<MileagePoint> Series);
public record ServiceValueDto(decimal Total, string PeriodLabel, IReadOnlyList<ServiceUsage> Items);
public record UsageSummaryDto(int TotalTrips, decimal AverageDailyKm, string MostUsedDay);
public record DashboardDto(Customer Customer, Vehicle Vehicle, Subscription Subscription, DateOnly ReferenceDate, bool IsDemo,
    MileageDto Mileage, IReadOnlyList<Alert> Alerts, Recommendation? NextBestAction, ServiceValueDto ServiceValue,
    IReadOnlyList<TimelineEvent> Timeline, UsageSummaryDto UsageSummary);
public record UsageMonthDto(string Month, string Label, decimal DistanceKm, int AllowanceKm, int Trips);
public record UsageDto(IReadOnlyList<UsageMonthDto> Months, IReadOnlyList<DailyUsage> Daily, IReadOnlyList<string> Insights);
public record TimelineDto(IReadOnlyList<TimelineEvent> Events);
public record RecommendationsDto(Recommendation? Recommendation);
public record ActionRequest(string? Type, string? TargetId, string? ScheduledDate);
public record ActionResponse(string Message, string EventId);
public record TrackEventRequest(string? Name, string? Page, string? Metadata);
public record EventCountDto(string Name, int Count);
public record RecentEventDto(string Id, string Name, string CustomerName, string Page, DateTime OccurredAt);
public record FeatureUsageDto(string Feature, int Users, int Events);
public record AdminDto(int TotalCustomers, int ActiveCustomers, int TotalEvents, int ActionsCompleted,
    decimal RecommendationConversion, IReadOnlyList<EventCountDto> EventsByName, IReadOnlyList<RecentEventDto> RecentEvents,
    IReadOnlyList<FeatureUsageDto> FeatureUsage);

public sealed class DashboardService(DrivePulseDb db, IReferenceClock clock, IRecommendationProvider recommendations)
{
    public async Task<DashboardDto> GetDashboard(CancellationToken ct)
    {
        var subscription = await db.Subscriptions.AsNoTracking().SingleAsync(ct);
        var first = new DateOnly(clock.Today.Year, clock.Today.Month, 1);
        var daily = await db.DailyUsage.AsNoTracking().Where(x => x.Date >= first && x.Date <= clock.Today).OrderBy(x => x.Date).ToListAsync(ct);
        var mileage = MileageCalculator.Calculate(daily.Sum(x => x.DistanceKm), subscription.MonthlyAllowanceKm, subscription.ExcessKmPrice, clock.Today);
        var alerts = await db.Alerts.AsNoTracking().OrderBy(x => x.DueDate).ToListAsync(ct);
        var handled = await db.Actions.AsNoTracking().Select(x => x.TargetId).ToListAsync(ct);
        var points = new List<MileagePoint>();
        decimal cumulative = 0;
        for (var day = 1; day <= DateTime.DaysInMonth(first.Year, first.Month); day++)
        {
            var date = first.AddDays(day - 1);
            cumulative += daily.FirstOrDefault(x => x.Date == date)?.DistanceKm ?? 0;
            points.Add(new(date, date <= clock.Today ? cumulative : 0, Math.Round(mileage.CurrentKm / clock.Today.Day * day, 2)));
        }
        var mostUsed = daily.OrderByDescending(x => x.DistanceKm).FirstOrDefault();
        var mostUsedDay = mostUsed is null ? "Sem uso registrado" : mostUsed.Date.ToString("dddd", System.Globalization.CultureInfo.GetCultureInfo("pt-BR"));
        return new(await db.Customers.AsNoTracking().SingleAsync(ct), await db.Vehicles.AsNoTracking().SingleAsync(ct), subscription, clock.Today, true,
            new(mileage.CurrentKm, mileage.ProjectedKm, mileage.AllowanceKm, mileage.ExcessKm, mileage.EstimatedExcessCost, mileage.DailyAverageKm, mileage.RemainingDays, mileage.SafeDailyKm, points),
            alerts, recommendations.Recommend(alerts, mileage, handled, clock.Today), await GetServices(ct),
            await db.Timeline.AsNoTracking().OrderByDescending(x => x.OccurredAt).ThenBy(x => x.Id).Take(8).ToListAsync(ct),
            new(daily.Sum(x => x.Trips), mileage.DailyAverageKm, mostUsedDay));
    }
    public async Task<ServiceValueDto> GetServices(CancellationToken ct)
    {
        // The legacy seed coverage reference is availability, not a performed service.
        var items = await db.Services.AsNoTracking().Where(x => x.Id != "service-insurance").OrderByDescending(x => x.Date).ToListAsync(ct);
        return new(items.Sum(x => x.ReferenceValue), "Desde o início da assinatura · valores de referência", items);
    }
    public async Task<UsageDto> GetUsage(int months, CancellationToken ct)
    {
        var first = new DateOnly(clock.Today.Year, clock.Today.Month, 1).AddMonths(1 - months);
        var daily = await db.DailyUsage.AsNoTracking().Where(x => x.Date >= first && x.Date <= clock.Today).OrderBy(x => x.Date).ToListAsync(ct);
        var allowance = (await db.Subscriptions.AsNoTracking().SingleAsync(ct)).MonthlyAllowanceKm;
        var result = new List<UsageMonthDto>();
        for (var i = 0; i < months; i++)
        {
            var date = first.AddMonths(i);
            var rows = daily.Where(x => x.Date.Year == date.Year && x.Date.Month == date.Month).ToList();
            result.Add(new(date.ToString("yyyy-MM"), date.ToString("MMM", System.Globalization.CultureInfo.GetCultureInfo("pt-BR")), rows.Sum(x => x.DistanceKm), allowance, rows.Sum(x => x.Trips)));
        }
        return new(result, daily,
            ["Nos meses anteriores você ficou dentro da franquia de 1.500 km.", "Outubro mostra o uso acumulado até 20/10; a projeção não representa uma cobrança confirmada.", "O plano de uso considera os dias restantes e ajuda a acompanhar seu ritmo."]);
    }
    public async Task<AdminDto> GetAdmin(CancellationToken ct)
    {
        var events = await db.Events.AsNoTracking().OrderByDescending(x => x.OccurredAt).ThenByDescending(x => x.Id).ToListAsync(ct);
        var customers = await db.Customers.AsNoTracking().ToListAsync(ct);
        var completedActions = await db.Actions.AsNoTracking().ToListAsync(ct);
        var actions = completedActions.Count(x => x.Type != "dismiss-recommendation");
        var conversion = RecommendationConversion.Calculate(events.Where(x => x.Name == "recommendation_view").Select(x => x.Metadata), completedActions);
        return new(customers.Count, events.Where(x => x.OccurredAt >= clock.UtcNow.AddDays(-30)).Select(x => x.CustomerId).Distinct().Count(), events.Count, actions,
            conversion,
            events.GroupBy(x => x.Name).Select(x => new EventCountDto(x.Key, x.Count())).OrderByDescending(x => x.Count).ToList(),
            events.Take(12).Select(x => new RecentEventDto(x.Id, x.Name, customers.FirstOrDefault(c => c.Id == x.CustomerId)?.Name ?? "Cliente demonstração", x.Page, x.OccurredAt)).ToList(),
            events.GroupBy(x => x.Page).Select(x => new FeatureUsageDto(x.Key, x.Select(e => e.CustomerId).Distinct().Count(), x.Count())).OrderByDescending(x => x.Events).ToList());
    }
}

