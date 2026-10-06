using DrivePulse.Api.Data;
using DrivePulse.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace DrivePulse.Api.Features;
public record ContractOption(string Id, string Name, string Description, decimal? MonthlyPrice, int? AllowanceKm, bool FitsUsage, bool Recommended, string Cta);
public record AccountDto(DashboardDto Dashboard, string MonthLabel, IReadOnlyList<ServiceUsage> UsedThisMonth,
    IReadOnlyList<OwnershipPart> IncludedReferences, IReadOnlyList<OwnershipPart> EstimatedCosts,
    OwnershipComparison Comparison, decimal RecentAverageKm, IReadOnlyList<ContractOption> ContractOptions,
    IReadOnlyList<string> RegisteredInterests, int ElapsedMonths, decimal SubscriptionPaidReference, string PeriodLabel, string ShareText,
    string StatementMonth, decimal UsedServicesReferenceTotal, int UsedServicesCount);
public sealed class AccountService(DrivePulseDb db, DashboardService dashboardService, IReferenceClock clock)
{
    public async Task<AccountDto> Get(CancellationToken ct)
    {
        var dashboard = await dashboardService.GetDashboard(ct);
        var comparison = OwnershipCalculator.Calculate(OwnershipInputs.Demo, dashboard.Subscription.MonthlyPrice);
        var first = new DateOnly(clock.Today.Year, clock.Today.Month, 1);
        var daily = await db.DailyUsage.AsNoTracking().Where(x => x.Date >= first.AddMonths(-3) && x.Date < first).ToListAsync(ct);
        var totals = daily.GroupBy(x => new { x.Date.Year, x.Date.Month }).Select(x => x.Sum(y => y.DistanceKm)).ToList();
        var average = totals.Count == 0 ? 0 : Math.Round(totals.Average(), 0);
        var price = dashboard.Subscription.MonthlyPrice;
        var options = new ContractOption[] {
            new("renew", "Renovar a assinatura", "Mesmo perfil de carro e franquia. Valor de referência; depende da proposta no fim do contrato.", price, dashboard.Subscription.MonthlyAllowanceKm, average <= dashboard.Subscription.MonthlyAllowanceKm, average <= dashboard.Subscription.MonthlyAllowanceKm, "Tenho interesse em renovar"),
            new("plan-1000", "Plano de 1.000 km", "Mensalidade menor, mas abaixo do seu uso recente. Excedentes podem anular a diferença.", price - 300, 1000, average <= 1000, false, "Simular interesse neste plano"),
            new("plan-2000", "Plano de 2.000 km", "Mais folga para meses de maior uso. O preço é uma hipótese, não uma oferta.", price + 300, 2000, average <= 2000, average > dashboard.Subscription.MonthlyAllowanceKm, "Tenho interesse neste plano"),
            new("buy", "Ficar com este carro", "Solicite uma proposta de compra no fim do contrato. Revenda da simulação não é preço de venda nem FIPE.", null, null, true, false, "Quero uma proposta de compra")
        };
        var elapsed = Math.Max(0, (clock.Today.Year - dashboard.Subscription.StartDate.Year) * 12 + clock.Today.Month - dashboard.Subscription.StartDate.Month + 1);
        var period = $"{dashboard.Subscription.StartDate:dd/MM/yyyy} a {clock.Today:dd/MM/yyyy}";
        var culture = System.Globalization.CultureInfo.GetCultureInfo("pt-BR");
        var usedServices = dashboard.ServiceValue.Items.Where(x => x.Id != "service-insurance").ToList();
        var usedTotal = usedServices.Sum(x => x.ReferenceValue);
        var statementMonth = first.AddMonths(-1);
        var share = $"Minha Conta Aberta · {period}\n{dashboard.Vehicle.Brand} {dashboard.Vehicle.Model} · {dashboard.Subscription.MonthlyAllowanceKm:N0} km/mês\n{usedServices.Count} serviços e documentos utilizados, com {usedTotal.ToString("C2", culture)} em valores de referência.\nMensalidade: {price.ToString("C2", culture)}. IPVA, proteção e cuidados conforme contrato.\nDrivePulse · protótipo não oficial, dados fictícios. Valores de referência não são economia garantida.";
        return new(dashboard, statementMonth.ToString("MMMM 'de' yyyy", culture), usedServices.Where(x => x.Date >= statementMonth && x.Date < first).ToList(),
            comparison.CashBreakdown.Where(x => x.Category == "included").ToList(), comparison.CashBreakdown.Where(x => x.Category == "estimated").ToList(),
            comparison, average, options, await db.Actions.AsNoTracking().Where(x => x.Type == "contract-interest").Select(x => x.TargetId).ToListAsync(ct),
            elapsed, price * elapsed, period, share, statementMonth.ToString("yyyy-MM"), usedTotal, usedServices.Count);
    }
}
