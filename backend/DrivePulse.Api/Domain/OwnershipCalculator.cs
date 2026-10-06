namespace DrivePulse.Api.Domain;

public record OwnershipInputs(decimal VehiclePrice, decimal ResaleValue, int Months, decimal DownPaymentPercent,
    decimal InterestMonthlyPercent, decimal YieldMonthlyPercent, decimal IpvaPercent, decimal InsuranceAnnual,
    decimal MaintenanceAnnual, decimal TiresTotal, decimal LicensingAnnual)
{
    // Creta Comfort 1.0 TB 12V Flex Aut. (FIPE 015200-5, out/2026): 0 km e revenda pela FIPE do modelo 2024.
    // Rendimento = CDI de 13,65% a.a. menos 15% de IR, ao mês. Juros de 26,61% a.a. ao mês.
    public static OwnershipInputs Demo => new(143276, 107163, 24, 20, 1.99m, .92m, 4, 4200, 1650, 2300, 230);

    public static IReadOnlyList<DataSource> DemoSources =>
    [
        new("Preço do carro 0 km", "R$ 143.276", "Tabela FIPE out/2026, Creta Comfort 1.0 TB Aut. (015200-5)", "https://veiculos.fipe.org.br/"),
        new("Revenda em 2 anos", "R$ 107.163", "Tabela FIPE out/2026, mesmo modelo, ano 2024", "https://veiculos.fipe.org.br/"),
        new("Rendimento do dinheiro", "0,92% ao mês", "CDI de 13,65% a.a. (Banco Central) menos 15% de IR", "https://www.bcb.gov.br/"),
        new("Juros do financiamento", "1,99% ao mês", "Média de 26,61% a.a. para veículos (Autoo, set/2026)", null),
        new("IPVA", "4% ao ano", "SEF/MG, alíquota para automóveis", "https://www.fazenda.mg.gov.br/"),
        new("Manutenção e pneus", "R$ 1.650/ano e R$ 2.300 por jogo", "Localiza Seminovos, “Manter um Onix é caro?” (nov/2025)", "https://seminovos.localiza.com/blog/posts/quanto-custa-manter-um-onix"),
        new("Seguro", "R$ 4.200/ano", "Estimativa: cerca de 3% do valor do carro", null),
    ];
}
public record DataSource(string Label, string Value, string Source, string? Url);
public record OwnershipPart(string Id, string Name, decimal MonthlyValue, string Explanation, string Category);
public record OwnershipComparison(OwnershipInputs Inputs, decimal SubscriptionMonthly, decimal CashMonthly,
    decimal FinancedMonthly, decimal Installment, decimal DownPayment, decimal CashDifference,
    decimal FinancedDifference, decimal CashPresentCost, decimal FinancedPresentCost, decimal SubscriptionPresentCost,
    IReadOnlyList<OwnershipPart> CashBreakdown, string Method, string Scope);

public static class OwnershipCalculator
{
    public static OwnershipComparison Calculate(OwnershipInputs p, decimal subscriptionMonthly)
    {
        if (p.VehiclePrice is < 10000 or > 1000000 || p.ResaleValue < 0 || p.ResaleValue > p.VehiclePrice || p.Months is < 12 or > 60
            || p.DownPaymentPercent is < 0 or > 100 || p.InterestMonthlyPercent is < 0 or > 5 || p.YieldMonthlyPercent is < 0 or > 3
            || p.IpvaPercent is < 0 or > 10 || p.InsuranceAnnual is < 0 or > 50000 || p.MaintenanceAnnual is < 0 or > 50000
            || p.TiresTotal is < 0 or > 50000 || p.LicensingAnnual is < 0 or > 5000 || subscriptionMonthly < 0)
            throw new ArgumentException("Confira os valores: preço de R$10 mil a R$1 milhão, revenda até o preço, prazo de 12 a 60 meses e taxas dentro dos limites do formulário.");
        var yield = (double)p.YieldMonthlyPercent / 100;
        var annuity = Enumerable.Range(1, p.Months).Sum(month => 1 / Math.Pow(1 + yield, month));
        var resalePresent = (double)p.ResaleValue / Math.Pow(1 + yield, p.Months);
        var vehicleMonthly = ((double)p.VehiclePrice - resalePresent) / annuity;
        var depreciation = (p.VehiclePrice - p.ResaleValue) / p.Months;
        var averageValue = (p.VehiclePrice + p.ResaleValue) / 2;
        var parts = new OwnershipPart[] {
            new("ipva", "IPVA", Round(averageValue * p.IpvaPercent / 100 / 12), "Alíquota simulada sobre o valor médio do carro no período.", "included"),
            new("protection", "Proteção / seguro", Round(p.InsuranceAnnual / 12), "Referência de seguro de um carro próprio; a proteção contratual tem regras próprias.", "included"),
            new("maintenance", "Manutenção", Round(p.MaintenanceAnnual / 12), "Provisão mensal de revisões e cuidados preventivos.", "included"),
            new("tires", "Pneus", Round(p.TiresTotal / p.Months), "Provisão no período; uso e cobertura dependem do contrato.", "included"),
            new("licensing", "Licenciamento", Round(p.LicensingAnnual / 12), "Referência anual dividida por 12 meses.", "included"),
            new("depreciation", "Desvalorização", Round(depreciation), "Preço de compra menos revenda esperada, dividido pelo prazo.", "estimated"),
            new("capital", "Custo do capital", Round((decimal)vehicleMonthly - depreciation), "Efeito do rendimento líquido escolhido e do prazo sobre o capital imobilizado.", "estimated")
        };
        var operating = parts.Where(x => x.Category == "included").Sum(x => x.MonthlyValue);
        var cash = parts.Sum(x => x.MonthlyValue);
        var down = p.VehiclePrice * p.DownPaymentPercent / 100;
        var principal = p.VehiclePrice - down;
        var interest = (double)p.InterestMonthlyPercent / 100;
        var installment = interest == 0 ? principal / p.Months : (decimal)((double)principal * interest / (1 - Math.Pow(1 + interest, -p.Months)));
        var financed = Round((decimal)(((double)down - resalePresent) / annuity) + installment + operating);
        return new(p, subscriptionMonthly, cash, financed, Round(installment), Round(down), cash - subscriptionMonthly,
            financed - subscriptionMonthly, Round(cash * (decimal)annuity), Round(financed * (decimal)annuity),
            Round(subscriptionMonthly * (decimal)annuity), parts,
            "Custo mensal equivalente: fluxos trazidos a valor presente pelo rendimento líquido e divididos pelo fator de anuidade. Despesas recorrentes são provisões mensais uniformes. A revenda entra somente no fim do período.",
            "Preços pela FIPE de out/2026 e taxas públicas; seguro é estimativa e a mensalidade é simulada. Mesma duração nas três opções. Combustível, estacionamento, multas e excedentes de km não estão incluídos. Não é cotação nem economia garantida.");
    }
    private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
