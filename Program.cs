using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Reflection;
using FormBuilderApi.Data;
using FormBuilderApi.Mapping;
using FormBuilderApi.Repositories.Interfaces;
using FormBuilderApi.Repositories.Implementations;
using FormBuilderApi.Services.Interfaces;
using FormBuilderApi.Services.Implementations;
using FormBuilderApi.Services;
using FormBuilderApi.Middleware;
using FormBuilderApi.Converters;

var builder = WebApplication.CreateBuilder(args);

// Controllers with JSON configuration
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new NullableGuidJsonConverter());
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressModelStateInvalidFilter = false;
    });
    // Add this with your other service registrations
builder.Services.AddScoped<IConditionalLogicValidator, ConditionalLogicValidator>();


// Database Configuration with fallback
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<FormBuilderDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);
        npgsqlOptions.CommandTimeout(60);
    }));

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Repositories
builder.Services.AddScoped<IFormRepository, FormRepository>();
builder.Services.AddScoped<IFormFieldRepository, FormFieldRepository>();
builder.Services.AddScoped<IFormResponseRepository, FormResponseRepository>();
builder.Services.AddScoped<IFormSettingsRepository, FormSettingsRepository>();

// Services
builder.Services.AddScoped<IFormService, FormService>();
builder.Services.AddScoped<IFormResponseService, FormResponseService>();
builder.Services.AddScoped<IFormValidationService, FormValidationService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

// Response Compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FormBuilder API",
        Version = "v1",
        Description = "A comprehensive API for building and managing dynamic forms with PostgreSQL backend",
        Contact = new OpenApiContact
        {
            Name = "FormBuilder Team",
            Email = "support@formbuilder.com"
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<FormBuilderDbContext>();

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

// Middleware Pipeline
app.UseGlobalExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "FormBuilder API V1");
        c.RoutePrefix = string.Empty;
        c.DisplayRequestDuration();
    });
}

app.UseResponseCompression();
// app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

// Database Migration
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FormBuilderDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        context.Database.Migrate();
        logger.LogInformation("Database initialized successfully");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database initialization failed");
        if (app.Environment.IsProduction()) throw;
    }
}

app.Logger.LogInformation("FormBuilder API started on {Environment}", app.Environment.EnvironmentName);
app.Run();
