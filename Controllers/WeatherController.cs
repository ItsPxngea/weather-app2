using Microsoft.AspNetCore.Mvc;
using WeatherAPI.Models;

namespace WeatherAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string? _apiKey;

        public WeatherController(IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _httpClient = httpClientFactory.CreateClient();
            _apiKey = config["OpenWeather:ApiKey"];
        }

        //Endpoint to get weather by city name for search functionality
        [HttpGet("{location}")]
        public async Task<ActionResult<Weather>> GetWeather(string location)
        {
            //catch error for no API key
            if (string.IsNullOrEmpty(_apiKey))
                return StatusCode(500, "API key is not configured");

            var encodedLocation = Uri.EscapeDataString(location);
            var url = $"https://api.openweathermap.org/data/2.5/weather?q={encodedLocation}&appid={_apiKey}&units=metric";
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) return NotFound("Location not found\n" + response.StatusCode);

            var json = await response.Content.ReadFromJsonAsync<OpenWeatherResponse>();
            if (json == null
                || json.Main == null
                || json.Wind == null
                || json.Weather?.Any() != true)
            {
                return NotFound("Failed to parse weather data\n" + response.StatusCode);
            }

            var weather = new Weather
            {
                Location = json.Name?.Trim() ?? "Unknown",
                Temp = (int)json.Main.Temp,
                Condition = json.Weather[0].Condition ?? "Unknown",
                Humidity = json.Main.Humidity,
                WindSpeed = (int)json.Wind.Speed,
                Precipitation = json.Rain != null ? (int)json.Rain.OneHour : 0
            };
            return Ok(weather);

        }
        //New endpoint to get weather by coordinates for users current location
        [HttpGet("coords")]
        public async Task<ActionResult<Weather>> GetWeatherByCoords(double lat, double lon)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return StatusCode(500, "API key is not configured");

            var url = $"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={_apiKey}&units=metric";
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) return NotFound("Location not found\n" + response.StatusCode);

            var json = await response.Content.ReadFromJsonAsync<OpenWeatherResponse>();
            if (json == null
                || json.Main == null
                || json.Wind == null
                || json.Weather?.Any() != true)
            {
                return NotFound("Failed to parse weather data\n" + response.StatusCode);
            }

            var weather = new Weather
            {
                Location = json.Name?.Trim() ?? "Unknown",
                Temp = (int)json.Main.Temp,
                Condition = json.Weather?[0].Condition ?? "Unknown",
                Humidity = json.Main.Humidity,
                WindSpeed = (int)json.Wind.Speed,
                Precipitation = json.Rain != null ? (int)json.Rain.OneHour : 0
            };
            return Ok(weather);
        }

        //Endpoint for forecast data
        [HttpGet("forecast/{location}")]
        public async Task<ActionResult<List<ForecastDay>>> GetForecast(string location)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return StatusCode(500, "API key is not configured");

            var encodedLocation = Uri.EscapeDataString(location);
            var url = $"https://api.openweathermap.org/data/2.5/forecast?q={encodedLocation}&appid={_apiKey}&units=metric";
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) return NotFound("Location not found\n" + response.StatusCode);

            var json = await response.Content.ReadFromJsonAsync<ForecastResponse>();
            if (json == null) return NotFound("Failed to parse forecast data\n" + response.StatusCode);

            var forecast = json.List
                .GroupBy(item => DateTimeOffset.FromUnixTimeSeconds(item.Dt).Date)
                .Take(8)
                .Select(group =>
                {
                    var midday = group.OrderBy(item => Math.Abs(DateTimeOffset.FromUnixTimeSeconds(item.Dt).Hour - 12)).First();
                    return new ForecastDay

                    {
                        Date = DateTimeOffset.FromUnixTimeSeconds(midday.Dt).ToString("ddd dd MMM"),
                        Temp = (int)midday.Main.Temp,
                        Condition = midday.Weather?[0].Condition ?? "Unknown",
                        Humidity = midday.Main.Humidity,
                        WindSpeed = (int)midday.Wind.Speed,
                        Precipitation = midday.Rain != null ? (int)midday.Rain.OneHour : 0
                    };
                })
                .ToList();

            return Ok(forecast);
        }

    }
}