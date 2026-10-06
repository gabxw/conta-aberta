using DrivePulse.Api.Data;

namespace DrivePulse.Api.Features;

public static class RecommendationConversion
{
    public static decimal Calculate(IEnumerable<string?> viewedIds, IEnumerable<CompletedAction> actions)
    {
        var viewed = viewedIds.Where(id => !string.IsNullOrWhiteSpace(id)).Select(id => id!).ToHashSet(StringComparer.Ordinal);
        if (viewed.Count == 0) return 0;
        var completed = actions.Where(action => action.Type != "dismiss-recommendation")
            .Select(action => action.TargetId).ToHashSet(StringComparer.Ordinal);
        return Math.Round(viewed.Count(completed.Contains) * 100m / viewed.Count, 1);
    }
}
