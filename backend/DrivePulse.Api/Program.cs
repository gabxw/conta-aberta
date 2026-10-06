using DrivePulse.Api.Data;
using DrivePulse.Api.Domain;
using DrivePulse.Api.Features;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
if (string.IsNullOrWhiteSpace(builder.Configuration["urls"]) && string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ASPNETCORE_URLS")))
    builder.WebHost.UseUrls("http://localhost:5080");
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(options => options.SerializerOptions.PropertyNameCaseInsensitive = true);
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 16 * 1024);
var connection = builder.Configuration.GetConnectionString("DrivePulse")
    ?? "Host=127.0.0.1;Port=5433;Database=drivepulse;Username=drivepulse;Password=drivepulse_demo_local";
builder.Services.AddDbContext<DrivePulseDb>(options => options.UseNpgsql(connection));
builder.Services.AddSingleton<IReferenceClock, DemoClock>();
builder.Services.AddScoped<IRecommendationProvider, RuleBasedRecommendationProvider>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<ActionService>();
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<AssistantService>();
var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.MapOpenApi();
await using (var scope = app.Services.CreateAsyncScope())
    await DemoSeed.Initialize(scope.ServiceProvider.GetRequiredService<DrivePulseDb>());

var api = app.MapGroup("/api/v1");
api.MapGet("/health", async (DrivePulseDb db, CancellationToken ct) =>
{
    try
    {
        return await db.Database.CanConnectAsync(ct)
            ? Results.Ok(new { status = "ready", database = "connected", isDemo = true })
            : Results.Problem("Banco de dados indisponível.", statusCode: 503, title: "API não está pronta");
    }
    catch { return Results.Problem("Banco de dados indisponível.", statusCode: 503, title: "API não está pronta"); }
});
api.MapGet("/dashboard", async (DashboardService service, CancellationToken ct) => Results.Ok(await service.GetDashboard(ct)));
api.MapGet("/account", async (AccountService service, CancellationToken ct) => Results.Ok(await service.Get(ct)));
api.MapPost("/comparison", async (OwnershipInputs inputs, DrivePulseDb db, CancellationToken ct) =>
{
    try { return Results.Ok(OwnershipCalculator.Calculate(inputs, (await db.Subscriptions.AsNoTracking().SingleAsync(ct)).MonthlyPrice)); }
    catch (ArgumentException error) { return Results.Problem(error.Message, statusCode: 400, title: "Premissas inválidas"); }
});
api.MapPost("/assistant", async (AssistantRequest request, AssistantService service, CancellationToken ct) =>
{
    try { return Results.Ok(await service.Ask(request, ct)); }
    catch (ArgumentException error) { return Results.Problem(error.Message, statusCode: 400, title: "Pergunta inválida"); }
    catch (AssistantUnavailableException error) { return Results.Problem(error.Message, statusCode: 503, title: "Assistente indisponível"); }
    catch (Anthropic.Exceptions.AnthropicApiException) { return Results.Problem("O assistente não respondeu agora. Tente de novo em instantes.", statusCode: 502, title: "Assistente indisponível"); }
});
api.MapGet("/services", async (DashboardService service, CancellationToken ct) => Results.Ok(await service.GetServices(ct)));
api.MapGet("/recommendations", async (DashboardService service, CancellationToken ct) => Results.Ok(new RecommendationsDto((await service.GetDashboard(ct)).NextBestAction)));
api.MapGet("/usage", async (int? months, DashboardService service, CancellationToken ct) =>
    months is < 1 or > 12 ? Results.Problem("Escolha um período entre 1 e 12 meses.", statusCode: 400, title: "Período inválido") : Results.Ok(await service.GetUsage(months ?? 6, ct)));
api.MapGet("/timeline", async (string? type, DrivePulseDb db, CancellationToken ct) =>
{
    var filter = type ?? "all";
    if (filter is not ("all" or "maintenance" or "mileage" or "document" or "assistance" or "subscription" or "recommendation"))
        return Results.Problem("Escolha um tipo de evento válido.", statusCode: 400, title: "Filtro inválido");
    var query = db.Timeline.AsNoTracking();
    if (filter != "all") query = query.Where(x => x.Type == filter);
    return Results.Ok(new TimelineDto(await query.OrderByDescending(x => x.OccurredAt).ThenBy(x => x.Id).ToListAsync(ct)));
});
api.MapPost("/actions", async (ActionRequest request, ActionService service, CancellationToken ct) =>
{
    try { return Results.Ok(await service.Execute(request, ct)); }
    catch (ActionValidationException error) { return Results.Problem(error.Message, statusCode: 400, title: "Ação inválida"); }
});
api.MapPost("/events", async (TrackEventRequest request, DrivePulseDb db, IReferenceClock clock, CancellationToken ct) =>
{
    if (request.Name is not ("page_view" or "recommendation_view" or "action_click" or "timeline_filter" or "usage_filter" or "account_view" or "comparison_run" or "assistant_ask" or "recap_share")
        || string.IsNullOrWhiteSpace(request.Page) || request.Page.Length > 120 || !request.Page.StartsWith('/')
        || request.Metadata?.Length > 2048)
        return Results.Problem("Informe um evento permitido, uma página válida de até 120 caracteres e metadados de até 2.048 caracteres.", statusCode: 400, title: "Evento inválido");
    db.Events.Add(new() { Name = request.Name, Page = request.Page, Metadata = request.Metadata, OccurredAt = clock.UtcNow });
    await db.SaveChangesAsync(ct);
    return Results.NoContent();
});
api.MapGet("/admin/overview", async (DashboardService service, CancellationToken ct) => Results.Ok(await service.GetAdmin(ct)));
app.Run();

public partial class Program { }
