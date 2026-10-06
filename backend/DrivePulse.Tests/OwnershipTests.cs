using DrivePulse.Api.Domain;
using Xunit;

namespace DrivePulse.Tests;
public class OwnershipTests
{
    [Fact]
    public void ZeroRatesIncludeDepreciationAndOperatingCostsWithoutDoubleCounting()
    {
        var result = OwnershipCalculator.Calculate(new(120000, 84000, 24, 20, 0, 0, 0, 2400, 1200, 0, 0), 2500);
        Assert.Equal(1800, result.CashMonthly);
        Assert.Equal(1800, result.FinancedMonthly);
        Assert.Equal(4000, result.Installment);
        Assert.Equal(-700, result.CashDifference);
        Assert.Equal(result.CashMonthly, result.CashBreakdown.Sum(x => x.MonthlyValue));
    }
    [Fact]
    public void BetterResaleReducesCostAndInterestMakesFinancingMoreExpensive()
    {
        var inputs = OwnershipInputs.Demo;
        var original = OwnershipCalculator.Calculate(inputs, 2890);
        var higherResale = OwnershipCalculator.Calculate(inputs with { ResaleValue = inputs.ResaleValue + 20000 }, 2890);
        Assert.True(higherResale.CashMonthly < original.CashMonthly);
        Assert.True(original.FinancedMonthly > original.CashMonthly);
        Assert.Equal(original.CashMonthly, original.CashBreakdown.Sum(x => x.MonthlyValue));
    }
    [Theory]
    [InlineData(-1, 50000, 24)]
    [InlineData(100000, 120000, 24)]
    [InlineData(100000, 50000, 0)]
    public void InvalidInputsAreRejected(decimal price, decimal resale, int months)
    {
        Assert.Throws<ArgumentException>(() => OwnershipCalculator.Calculate(OwnershipInputs.Demo with { VehiclePrice = price, ResaleValue = resale, Months = months }, 2890));
    }
}
