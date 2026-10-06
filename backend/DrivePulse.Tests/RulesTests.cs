using DrivePulse.Api.Domain;
using Xunit;

namespace DrivePulse.Tests;

public class RulesTests
{
    [Fact]
    public void ProjectionUsesElapsedCalendarDaysAndContractPrice()
    {
        var result = MileageCalculator.Calculate(1180.65m, 1500, .75m, new DateOnly(2026, 10, 20));
        Assert.Equal(1830, result.ProjectedKm);
        Assert.Equal(330, result.ExcessKm);
        Assert.Equal(247.50m, result.EstimatedExcessCost);
        Assert.Equal(11, result.RemainingDays);
        Assert.Equal(29.03m, result.SafeDailyKm);
    }

    [Fact]
    public void LastDayHasNoRemainingDistanceBudgetAndProjectionUsesFebruaryLength()
    {
        var result = MileageCalculator.Calculate(1600, 1500, .75m, new DateOnly(2028, 2, 29));
        Assert.Equal(1600, result.ProjectedKm);
        Assert.Equal(0, result.RemainingDays);
        Assert.Equal(0, result.SafeDailyKm);
    }

    [Fact]
    public void CriticalMaintenanceOutranksMileageThenDocumentAndCompletedItemsDisappear()
    {
        var date = new DateOnly(2026, 10, 20);
        var alerts = new[] {
            new Alert { Id="document", Type="document", Severity="warning", DueDate=date.AddDays(5), Status="pending", ActionType="review-document" },
            new Alert { Id="maintenance", Type="maintenance", Severity="critical", DueDate=date.AddDays(-1), Status="pending", ActionType="schedule-maintenance" }
        };
        var provider = new RuleBasedRecommendationProvider();
        var mileage = MileageCalculator.Calculate(1180.65m, 1500, .75m, date);
        Assert.Equal("maintenance", provider.Recommend(alerts, mileage, [], date)!.Id);
        alerts[1].Status="scheduled";
        Assert.Equal("mileage-plan", provider.Recommend(alerts, mileage, [], date)!.Id);
        Assert.Equal("document", provider.Recommend(alerts, mileage, ["mileage-plan"], date)!.Id);
        Assert.Null(provider.Recommend(alerts, mileage, ["mileage-plan", "document"], date));
    }

    [Fact]
    public void NoExcessAndNoNearDueAlertProducesNoRecommendation()
    {
        var date = new DateOnly(2026, 10, 20);
        var provider = new RuleBasedRecommendationProvider();
        var mileage = MileageCalculator.Calculate(500, 1500, .75m, date);
        Assert.Null(provider.Recommend([], mileage, [], date));
    }
    [Fact]
    public void MileageRecommendationUsesPortugueseNumberFormattingRegardlessOfServerCulture()
    {
        var original = System.Globalization.CultureInfo.CurrentCulture;
        try
        {
            System.Globalization.CultureInfo.CurrentCulture = System.Globalization.CultureInfo.GetCultureInfo("en-US");
            var date = new DateOnly(2026, 10, 20);
            var recommendation = new RuleBasedRecommendationProvider().Recommend([], MileageCalculator.Calculate(1180.65m, 1500, .75m, date), [], date);
            Assert.Contains("1.830 km", recommendation!.Description);
        }
        finally { System.Globalization.CultureInfo.CurrentCulture = original; }
    }}

