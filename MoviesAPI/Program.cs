using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MoviesAPI.Data;
using MoviesAPI.Repositories;
using MoviesAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add PostgreSQL DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register repositories and services
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();

// new movie repository and service added
builder.Services.AddScoped<IMovieRepository, MovieRepository>();
builder.Services.AddScoped<IMovieService, MovieService>();

// new watchlist repository and service added
builder.Services.AddScoped<IWatchlistRepository, WatchlistRepository>();
builder.Services.AddScoped<IWatchlistService, WatchlistService>();

// new review repository and service added
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IReviewService, ReviewService>();

// added new people/movie repositories and services
builder.Services.AddScoped<IPersonRepository, PersonRepository>();
builder.Services.AddScoped<IPersonService, PersonService>();
builder.Services.AddScoped<IMoviePersonRepository, MoviePersonRepository>();
builder.Services.AddScoped<IMoviePersonService, MoviePersonService>();

// Add Cors (to make backend work with angular)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT Key is not configured in appsettings");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// new controllers (allow for text to be shown inside Swagger)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.UseInlineDefinitionsForEnums(); // newly added (alows for text to be shown inside swagger)
    
    c.SwaggerDoc("v1", new() { Title = "Movies API", Version = "v1" });
   
    // Add JWT authentication to Swagger UI
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
   
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// connect backend with angular
app.UseCors("AllowAngular");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => Results.Text("Movies API running!", "text/plain"));

app.Run();