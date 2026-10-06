using DrivePulse.Api.Data;
using DrivePulse.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace DrivePulse.Api.Features;

// O que a assinatura cobre hoje: o valor equivalente de ter o carro, distribuído pelos dias do mês.
public record DailyValue(decimal CoveredThisMonth, decimal CoveredToday, int DayOfMonth, int DaysInMonth,
    IReadOnlyList<decimal> CumulativeByDay);
public record ContextualBenefit(string Title, string Partner, string Distance, string Discount, string Reason);
public record Destination(string City, int Trips, int Km);
public record RecapEquivalent(int Count, string Label);
public record Recap(string PeriodLabel, int Months, int TotalKm, decimal WorldTripPercent, int KmToMoon,
    Destination FavoriteDestination, IReadOnlyList<Destination> OtherDestinations, decimal CoveredTotal,
    decimal PaidTotal, decimal Difference, IReadOnlyList<RecapEquivalent> Equivalents, string ShareText);

public record AccountDto(DashboardDto Dashboard, string MonthLabel, IReadOnlyList<ServiceUsage> UsedThisMonth,
    IReadOnlyList<OwnershipPart> IncludedReferences, IReadOnlyList<OwnershipPart> EstimatedCosts,
    OwnershipComparison Comparison, IReadOnlyList<DataSource> Sources, decimal RecentAverageKm, int ElapsedMonths,
    decimal SubscriptionPaidReference, string PeriodLabel, string StatementMonth, decimal UsedServicesReferenceTotal,
    int UsedServicesCount, DailyValue Today, ContextualBenefit Benefit, Recap Recap);

public sealed class AccountService(DrivePulseDb db, DashboardService dashboardService, IReferenceClock clock)
{
    const decimal WorldKm = 40075, MoonKm = 384400;

    public async Task<AccountDto> Get(CancellationToken ct)
    {
        var dashboard = await dashboardService.GetDashboard(ct);
        var subscription = dashboard.Subscription;
        var comparison = OwnershipCalculator.Calculate(OwnershipInputs.Demo, subscription.MonthlyPrice);
        var today = clock.Today;
        var first = new DateOnly(today.Year, today.Month, 1);
        var culture = System.Globalization.CultureInfo.GetCultureInfo("pt-BR");

        var usage = await db.DailyUsage.AsNoTracking().ToListAsync(ct);
        var recentTotals = usage.Where(x => x.Date >= first.AddMonths(-3) && x.Date < first)
            .GroupBy(x => new { x.Date.Year, x.Date.Month }).Select(x => x.Sum(y => y.DistanceKm)).ToList();
        var average = recentTotals.Count == 0 ? 0 : Math.Round(recentTotals.Average(), 0);

        var elapsed = Math.Max(0, (today.Year - subscription.StartDate.Year) * 12 + today.Month - subscription.StartDate.Month + 1);
        var period = $"{subscription.StartDate:dd/MM/yyyy} a {today:dd/MM/yyyy}";
        var usedServices = dashboard.ServiceValue.Items.Where(x => x.Id != "service-insurance").ToList();
        var statementMonth = first.AddMonths(-1);

        var daysInMonth = DateTime.DaysInMonth(today.Year, today.Month);
        var perDay = Math.Round(comparison.CashMonthly / daysInMonth, 2);
        var daily = new DailyValue(perDay * today.Day, perDay, today.Day, daysInMonth,
            Enumerable.Range(1, today.Day).Select(d => perDay * d).ToList());

        // Benefício do clube escolhido pelo contexto do dia (demonstrativo).
        var benefit = new ContextualBenefit("Estacionamento perto de você", "Estacionamento parceiro", "300 m", "20% de desconto",
            "Você costuma estacionar nesta região às terças. Benefício do clube de demonstração.");

        var recap = BuildRecap(usage.Sum(x => x.DistanceKm), elapsed, comparison.CashMonthly, subscription.MonthlyPrice,
            comparison.CashBreakdown, period, dashboard.Vehicle.Model, culture);

        return new(dashboard, statementMonth.ToString("MMMM 'de' yyyy", culture),
            usedServices.Where(x => x.Date >= statementMonth && x.Date < first).ToList(),
            comparison.CashBreakdown.Where(x => x.Category == "included").ToList(),
            comparison.CashBreakdown.Where(x => x.Category == "estimated").ToList(),
            comparison, OwnershipInputs.DemoSources, average, elapsed, subscription.MonthlyPrice * elapsed, period,
            statementMonth.ToString("yyyy-MM"), usedServices.Sum(x => x.ReferenceValue), usedServices.Count,
            daily, benefit, recap);
    }

    public static Recap BuildRecap(decimal totalKm, int months, decimal cashMonthly, decimal price,
        IReadOnlyList<OwnershipPart> parts, string period, string vehicleModel, System.Globalization.CultureInfo culture)
    {
        var km = (int)Math.Round(totalKm);
        var covered = Math.Round(cashMonthly * months, 2);
        var paid = price * months;
        var difference = covered - paid;
        decimal Monthly(string id) => parts.Single(x => x.Id == id).MonthlyValue;
        // Quantas vezes a diferença paga cada custo anual de um carro próprio (arredondado para baixo).
        var equivalents = new List<RecapEquivalent>();
        if (difference > 0)
        {
            void Add(decimal yearly, string singular, string plural)
            {
                var n = (int)Math.Floor(difference / yearly);
                if (n >= 1) equivalents.Add(new(n, n == 1 ? singular : plural));
            }
            Add(Monthly("ipva") * 12, "ano de IPVA", "anos de IPVA");
            Add(Monthly("protection") * 12, "ano de seguro", "anos de seguro");
            Add(OwnershipInputs.Demo.TiresTotal, "jogo de pneus", "jogos de pneus");
        }
        var favorite = new Destination("Rio de Janeiro", 3, 2610);
        var others = new List<Destination> { new("Ouro Preto", 2, 400), new("Tiradentes", 1, 380) };
        var share = $"Minha assinatura em {months} meses: {km.ToString("N0", culture)} km rodados, destino favorito {favorite.City}.\n" +
                    $"Ter este {vehicleModel} custaria {covered.ToString("C0", culture)} no período; paguei {paid.ToString("C0", culture)} de mensalidade.\n" +
                    "DrivePulse · conceito Conta Aberta, dados de demonstração.";
        return new(period, months, km, Math.Round(km / WorldKm * 100, 1), (int)(MoonKm - km), favorite, others,
            covered, paid, difference, equivalents, share);
    }
}
