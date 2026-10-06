using DrivePulse.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace DrivePulse.Api.Data;

public sealed class Customer
{
    public string Id { get; set; } = "marina-costa";
    public string Name { get; set; } = "Marina Costa";
    public string FirstName { get; set; } = "Marina";
    public string Email { get; set; } = "marina@example.com";
}
public sealed class Vehicle
{
    public string Id { get; set; } = "creta-2025";
    public string Brand { get; set; } = "Hyundai";
    public string Model { get; set; } = "Creta";
    public string Version { get; set; } = "Comfort 1.0 TGDI";
    public int Year { get; set; } = 2025;
    public string Plate { get; set; } = "DPL5A26";
    public string Color { get; set; } = "Verde Amazon";
    public decimal OdometerKm { get; set; } = 18480.65m;
}
public sealed class Subscription
{
    [System.Text.Json.Serialization.JsonIgnore] public string CustomerId { get; set; } = "marina-costa";
    [System.Text.Json.Serialization.JsonIgnore] public string VehicleId { get; set; } = "creta-2025";
    public string Id { get; set; } = "subscription-marina";
    public string PlanName { get; set; } = "Essencial Plus";
    public decimal MonthlyPrice { get; set; } = 2890;
    public int MonthlyAllowanceKm { get; set; } = 1500;
    public decimal ExcessKmPrice { get; set; } = .75m;
    public DateOnly StartDate { get; set; } = new(2026, 4, 1);
    public DateOnly EndDate { get; set; } = new(2028, 3, 31);
}
public sealed class DailyUsage
{
    [System.Text.Json.Serialization.JsonIgnore] public string VehicleId { get; set; } = "creta-2025";
    public DateOnly Date { get; set; }
    public decimal DistanceKm { get; set; }
    public int Trips { get; set; }
}
public sealed class ServiceUsage
{
    [System.Text.Json.Serialization.JsonIgnore] public string SubscriptionId { get; set; } = "subscription-marina";
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public DateOnly Date { get; set; }
    public decimal ReferenceValue { get; set; }
    public string Description { get; set; } = "";
}
public sealed class TimelineEvent
{
    [System.Text.Json.Serialization.JsonIgnore] public string VehicleId { get; set; } = "creta-2025";
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Type { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public DateTime OccurredAt { get; set; }
    public string Status { get; set; } = "completed";
}
public sealed class CompletedAction
{
    [System.Text.Json.Serialization.JsonIgnore] public string CustomerId { get; set; } = "marina-costa";
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Type { get; set; } = "";
    public string TargetId { get; set; } = "";
    public DateOnly? ScheduledDate { get; set; }
    public string EventId { get; set; } = "";
    public string Message { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
public sealed class AnalyticsEvent
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string CustomerId { get; set; } = "marina-costa";
    public string Name { get; set; } = "";
    public string Page { get; set; } = "";
    public string? Metadata { get; set; }
    public DateTime OccurredAt { get; set; }
}

public sealed class DrivePulseDb(DbContextOptions<DrivePulseDb> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<DailyUsage> DailyUsage => Set<DailyUsage>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<ServiceUsage> Services => Set<ServiceUsage>();
    public DbSet<TimelineEvent> Timeline => Set<TimelineEvent>();
    public DbSet<CompletedAction> Actions => Set<CompletedAction>();
    public DbSet<AnalyticsEvent> Events => Set<AnalyticsEvent>();
    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<Subscription>().HasOne<Customer>().WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
        model.Entity<Subscription>().HasOne<Vehicle>().WithMany().HasForeignKey(x => x.VehicleId).OnDelete(DeleteBehavior.Restrict);
        model.Entity<Subscription>().HasIndex(x => x.CustomerId).IsUnique();
        model.Entity<Subscription>().HasIndex(x => x.VehicleId).IsUnique();
        model.Entity<DailyUsage>().HasOne<Vehicle>().WithMany().HasForeignKey(x => x.VehicleId).OnDelete(DeleteBehavior.Restrict);
        model.Entity<ServiceUsage>().HasOne<Subscription>().WithMany().HasForeignKey(x => x.SubscriptionId).OnDelete(DeleteBehavior.Restrict);
        model.Entity<Alert>().HasOne<Subscription>().WithMany().HasForeignKey(x => x.SubscriptionId).OnDelete(DeleteBehavior.Restrict);
        model.Entity<TimelineEvent>().HasOne<Vehicle>().WithMany().HasForeignKey(x => x.VehicleId).OnDelete(DeleteBehavior.Restrict);
        model.Entity<CompletedAction>().HasOne<Customer>().WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
        model.Entity<AnalyticsEvent>().HasOne<Customer>().WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
        model.Entity<DailyUsage>().HasKey(x => x.Date);
        model.Entity<CompletedAction>().HasIndex(x => new { x.Type, x.TargetId }).IsUnique();
        model.Entity<AnalyticsEvent>().HasIndex(x => x.OccurredAt);
        model.Entity<AnalyticsEvent>().Property(x => x.Name).HasMaxLength(64);
        model.Entity<AnalyticsEvent>().Property(x => x.Page).HasMaxLength(120);
        model.Entity<AnalyticsEvent>().Property(x => x.Metadata).HasMaxLength(2048);
        foreach (var entity in model.Model.GetEntityTypes())
            foreach (var property in entity.GetProperties().Where(p => p.ClrType == typeof(decimal)))
                property.SetPrecision(12);
        model.Entity<DailyUsage>().Property(x => x.DistanceKm).HasPrecision(12, 2);
        model.Entity<Vehicle>().Property(x => x.OdometerKm).HasPrecision(12, 2);
        model.Entity<Subscription>().Property(x => x.MonthlyPrice).HasPrecision(12, 2);
        model.Entity<Subscription>().Property(x => x.ExcessKmPrice).HasPrecision(12, 2);
        model.Entity<ServiceUsage>().Property(x => x.ReferenceValue).HasPrecision(12, 2);
    }
}

public interface IReferenceClock { DateOnly Today { get; } DateTime UtcNow { get; } }
public sealed class DemoClock : IReferenceClock
{
    public DateOnly Today => new(2026, 10, 20);
    public DateTime UtcNow => DateTime.SpecifyKind(Today.ToDateTime(TimeOnly.FromDateTime(DateTime.UtcNow)), DateTimeKind.Utc);
}

public static class DemoSeed
{
    public static async Task Initialize(DrivePulseDb db)
    {
        await db.Database.EnsureCreatedAsync();
        if (await db.Customers.AnyAsync()) return;
        db.Customers.Add(new()); db.Vehicles.Add(new()); db.Subscriptions.Add(new());
        var monthlyDistances = new decimal[] { 1134, 1280, 1428, 1362, 1486, 1180.65m };
        for (var month = 5; month <= 10; month++)
        {
            var lastDay = month == 10 ? 20 : DateTime.DaysInMonth(2026, month);
            var weights = Enumerable.Range(1, lastDay).Select(d => 28 + (d * 17 % 49)).ToArray();
            var totalWeight = weights.Sum();
            decimal allocated = 0;
            for (var day = 1; day <= lastDay; day++)
            {
                var distance = day == lastDay ? monthlyDistances[month - 5] - allocated : Math.Round(monthlyDistances[month - 5] * weights[day - 1] / totalWeight, 2);
                allocated += distance;
                db.DailyUsage.Add(new() { Date = new(2026, month, day), DistanceKm = distance, Trips = 2 + day % 4 });
            }
        }
        db.Alerts.AddRange(
            new Alert { Id = "maintenance-20k", Type = "maintenance", Severity = "critical", Title = "Revisão preventiva em atraso", Description = "Sua revisão preventiva venceu em 18 de outubro. Escolha uma data para registrar o agendamento de demonstração.", DueDate = new(2026, 10, 18), ActionType = "schedule-maintenance" },
            new Alert { Id = "mileage-october", Type = "mileage", Severity = "warning", Title = "Seu ritmo pode superar a franquia", Description = "A projeção é de 1.830 km: 330 km acima da franquia. Estimativa de excedente: R$ 247,50.", DueDate = new(2026, 10, 31), ActionType = "mileage-plan" },
            new Alert { Id = "document-crlv", Type = "document", Severity = "info", Title = "Conferência do CRLV disponível", Description = "Confira os dados do CRLV digital de demonstração antes de 30 de outubro.", DueDate = new(2026, 10, 30), ActionType = "review-document" });
        db.Services.AddRange(
            new ServiceUsage { Id = "service-insurance", Name = "Proteção do veículo", Date = new(2026, 10, 1), ReferenceValue = 340, Description = "Cobertura incluída no plano. Valor de referência mensal fictício." },
            new ServiceUsage { Id = "service-tyre", Name = "Assistência com pneu", Date = new(2026, 9, 22), ReferenceValue = 180, Description = "Atendimento de assistência utilizado, sem cobrança adicional." },
            new ServiceUsage { Id = "service-maintenance", Name = "Revisão de 10.000 km", Date = new(2026, 7, 15), ReferenceValue = 780, Description = "Manutenção preventiva incluída. Valor de referência do serviço." },
            new ServiceUsage { Id = "service-licensing", Name = "Licenciamento anual", Date = new(2026, 4, 10), ReferenceValue = 190, Description = "Documentação incluída no contrato. Valor fictício de referência." });
        db.Timeline.AddRange(
            Event("timeline-delivery", "subscription", "Seu Creta chegou", "Início da assinatura Essencial Plus.", new(2026, 4, 1)),
            Event("timeline-licensing", "document", "Documentação em dia", "Licenciamento anual incluído concluído.", new(2026, 4, 10)),
            Event("timeline-maintenance", "maintenance", "Revisão de 10.000 km concluída", "Manutenção preventiva realizada pela rede parceira.", new(2026, 7, 15)),
            Event("timeline-assistance", "assistance", "Assistência que resolveu", "Atendimento para pneu registrado e concluído.", new(2026, 9, 22)),
            Event("timeline-mileage", "mileage", "Um mês com mais movimento", "Acompanhamento identificou projeção acima da franquia.", new(2026, 10, 20)));
        db.Events.AddRange(
            new AnalyticsEvent { Id = "seed-page-view", Name = "page_view", Page = "/", OccurredAt = Utc(new(2026, 10, 20)) },
            new AnalyticsEvent { Id = "seed-rec-view", Name = "recommendation_view", Page = "/", Metadata = "maintenance-20k", OccurredAt = Utc(new(2026, 10, 20)) });
        await db.SaveChangesAsync();
    }
    private static TimelineEvent Event(string id, string type, string title, string description, DateOnly date) => new() { Id = id, Type = type, Title = title, Description = description, OccurredAt = Utc(date) };
    private static DateTime Utc(DateOnly date) => DateTime.SpecifyKind(date.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
}


