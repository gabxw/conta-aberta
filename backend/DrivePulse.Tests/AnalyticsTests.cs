using DrivePulse.Api.Data;
using DrivePulse.Api.Features;
using Xunit;

namespace DrivePulse.Tests;

public class AnalyticsTests
{
    [Fact]
    public void ConversionCountsDistinctViewedRecommendationsCompletedWithoutDismissals()
    {
        string?[] views = ["maintenance-20k", "maintenance-20k", "mileage-plan", null, ""];
        CompletedAction[] actions = [
            new() { Type = "schedule-maintenance", TargetId = "maintenance-20k" },
            new() { Type = "review-document", TargetId = "document-crlv" },
            new() { Type = "dismiss-recommendation", TargetId = "mileage-plan" }
        ];
        Assert.Equal(50m, RecommendationConversion.Calculate(views, actions));
        Assert.Equal(0m, RecommendationConversion.Calculate([], actions));
    }
}
