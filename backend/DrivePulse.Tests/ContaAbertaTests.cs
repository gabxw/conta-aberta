using System.Globalization;
using System.Text.Json;
using DrivePulse.Api.Domain;
using DrivePulse.Api.Features;
using Xunit;

namespace DrivePulse.Tests;
public class ContaAbertaTests
{
    static readonly CultureInfo PtBr = CultureInfo.GetCultureInfo("pt-BR");

    [Fact]
    public void DemoUsesFipeValuesAndListsASourceForEachPremise()
    {
        Assert.Equal(143276, OwnershipInputs.Demo.VehiclePrice);
        Assert.Equal(107163, OwnershipInputs.Demo.ResaleValue);
        Assert.All(OwnershipInputs.DemoSources, s => Assert.False(string.IsNullOrWhiteSpace(s.Source)));
    }

    [Fact]
    public void AssistantToolUsesContractDefaultsAndAppliesOnlyTheChangedPremise()
    {
        var (defaults, error1) = AssistantService.RunTool("simular_custos", "{}", 2890);
        var (betterResale, error2) = AssistantService.RunTool("simular_custos", """{"revenda": 120000}""", 2890);
        Assert.False(error1);
        Assert.False(error2);
        var expected = OwnershipCalculator.Calculate(OwnershipInputs.Demo, 2890).CashMonthly;
        Assert.Equal(expected, JsonDocument.Parse(defaults).RootElement.GetProperty("custo_mensal_a_vista").GetDecimal());
        Assert.True(JsonDocument.Parse(betterResale).RootElement.GetProperty("custo_mensal_a_vista").GetDecimal() < expected);
    }

    [Theory]
    [InlineData("simular_custos", """{"revenda": 999999999}""")]
    [InlineData("simular_custos", "nao e json")]
    [InlineData("apagar_contrato", "{}")]
    public void AssistantToolRejectsInvalidCallsInsteadOfInventingNumbers(string tool, string input)
    {
        var (_, isError) = AssistantService.RunTool(tool, input, 2890);
        Assert.True(isError);
    }

    [Fact]
    public void RecapComparesCoveredValueWithPaidAndOnlyCountsWholeEquivalents()
    {
        var parts = OwnershipCalculator.Calculate(OwnershipInputs.Demo, 2890).CashBreakdown;
        var recap = AccountService.BuildRecap(8015, 7, 3700, 2890, parts, "período", "Creta", PtBr);
        Assert.Equal(25900, recap.CoveredTotal);
        Assert.Equal(20230, recap.PaidTotal);
        Assert.Equal(5670, recap.Difference);
        Assert.Equal(20, recap.WorldTripPercent);
        Assert.Equal(384400 - 8015, recap.KmToMoon);
        Assert.All(recap.Equivalents, e => Assert.True(e.Count >= 1));
    }

    [Fact]
    public void RecapHasNoEquivalentsWhenTheSubscriptionCostsMore()
    {
        var parts = OwnershipCalculator.Calculate(OwnershipInputs.Demo, 2890).CashBreakdown;
        var recap = AccountService.BuildRecap(5000, 6, 2000, 2890, parts, "período", "Creta", PtBr);
        Assert.True(recap.Difference < 0);
        Assert.Empty(recap.Equivalents);
    }
}
