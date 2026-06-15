var builder = WebApplication.CreateBuilder(args);


builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddHttpClient();

var apiKey = Environment.GetEnvironmentVariable("API_KEY");
builder.Configuration["OpenWeather:ApiKey"] = apiKey;

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy=>
    {policy.WithOrigins("http://localhost:3000", "https://mj-weather-app-project.netlify.app")
        .AllowAnyHeader()
        .AllowAnyMethod();
        });
    /*options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
            */
});
var app = builder.Build();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
//app.MapControllers();

app.Run();
