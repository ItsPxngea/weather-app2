using System.Text.Json.Serialization;
namespace WeatherAPI.Models
{
    public class Weather
    {
        public string Location { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public int Temp { get; set; }
        public int Humidity { get; set; }
        public int WindSpeed { get; set; }
        public int Precipitation { get; set; }

    }
    public class OpenWeatherResponse
    {
        public string? Name { get; set; }
        public MainData? Main { get; set; }
        public List<WeatherDescription>? Weather { get; set; }
        public WindData? Wind { get; set; }
        public RainInfo? Rain { get; set; }

    }
    public class MainData
    {
        public double Temp { get; set; }
        public int Humidity { get; set; }
    }
    public class WeatherDescription
    {
        [JsonPropertyName("main")]
        public string? Condition { get; set; }
    }
    public class WindData
    {
        public double Speed { get; set; }
    }
    public class RainInfo
    {
        [JsonPropertyName("1h")]
        public double OneHour { get; set; }
    }

    public class ForecastDay
    {
        public string Date { get; set; } = string.Empty;
        public int Temp { get; set; }
        public string Condition { get; set; } = string.Empty;
        public int Humidity { get; set; }
        public int WindSpeed { get; set; }
        public int Precipitation { get; set; }
    }
    public class ForecastResponse
    {
        public List<ForecastItem> List { get; set; } = new List<ForecastItem>();
    }
    public class ForecastItem
    {
        public long Dt { get; set; }
        public MainData? Main { get; set; }
        public List<WeatherDescription>? Weather { get; set; }
        public WindData? Wind { get; set; }
        public RainInfo? Rain { get; set; }

    }
}