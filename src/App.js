import React, { useState, useEffect } from "react";
import "./Weather.css";

function WeatherApp() {

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [localWeather, setLocalWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [defaultCity, setDefaultCity] = useState(null);

  //useEffect to fetch weather data for predefined cities and user location on component mount, with error handling and loading state management
  useEffect(() => {
   
    //Method to fetch user location and weather data based on coordinates, with error handling for geolocation issues and fetch failures
    const fetchUserLocation = () => {
      if (!navigator.geolocation) {
        setError("Geolocation not supported by your browser");
        setLoading(false);
        return;
      }

      //Prompt user for location access and fetch weather data based on coordinates, with error handling for denied access or fetch failures
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`${process.env.REACT_APP_WEATHER_API_URL}/coords?lat=${latitude}&lon=${longitude}`)
            .then(r => r.json())
            .then(data => {
              setLocalWeather(data); setDefaultCity(data.location); return fetch(`${process.env.REACT_APP_WEATHER_API_URL}/forecast/${encodeURIComponent(data.location)}`);
            })
            .then(r => r.json())
            .then(forecastData => setForecast(forecastData))
            .catch(() => setError("Failed to fetch weather for your location"))
            .finally(() => setLoading(false));
        },
        () => {
          setError("Location access denied. Please allow location access to see weather.");
          setLoading(false);
        }
      );
    }
    fetchUserLocation();
  }, []);

  //Calling the API to search for weather data based on user input, with error handling and loading state management
  const handleSearch = async () => {
    if (!searchCity.trim()) return;
    //setSearchResult(null);

    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_WEATHER_API_URL}/${encodeURIComponent(searchCity)}`),
        
        fetch(`${process.env.REACT_APP_WEATHER_API_URL}/forecast/${encodeURIComponent(searchCity)}`)
      ]);
      if (!weatherRes.ok) throw new Error("City not found during search");

      const weatherData=await weatherRes.json();
      const forecastData = await forecastRes.json();
      setForecast(forecastData);
      setSearchResult(weatherData);
    }
    catch (e) {
      setSearchError("Please enter a valid city name");
    } finally {
      setLoading(false);
    }
  };

  //Clearing the search results and restoring the default forecast, with error handling for fetch failures
  const handleClearSearch = async () => {
    setSearchResult(null);
    setSearchCity(defaultCity || "");
    setSearchError(null);
    if (defaultCity !== null) {
      try {

        const forecastRes = await fetch(`${process.env.REACT_APP_WEATHER_API_URL}/forecast/${encodeURIComponent(defaultCity)}`);
        const forecastData = await forecastRes.json();
        setSearchCity(forecastData.location);
        setForecast(forecastData);
      } catch (e) {
        setSearchError("Failed to restore forecast");
      }
    }
  };

  //Clearing search error after 5 seconds to prevent blocking the UI, with cleanup to avoid memory leaks
  useEffect(() => {
    if (searchError) {
      const timer = setTimeout(() => setSearchError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchError]);

  //loading state with loading bar
  if (loading) return (
    <div className="loading-container">
      <div className="spinner" data-testid="spinner"></div>
    </div>

  );
  
  //catch amd throw errors
  if (error) return <p className="error">{error}</p>

  console.log("forecast:", forecast);
  console.log("defaultCity:", defaultCity);
  console.log("localWeather:", localWeather);
  console.log("loading:", loading);
  console.log("error:", error);

  return (
    /*root container for the weather app */
    <div className="app-container">
      {/*Weather Container*/}
      <h1 className="weather-title">Local Weather</h1>
      {/* Search bar */}
      <div className="search-container">
        <input
          type="text"
          id="city-search"
          name="city-search"
          className="search-input"
          placeholder="Search city..."
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />{/*search button*/}
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>{/*clear search button*/}

        <button className="search-button" onClick={handleClearSearch}>
          Clear
        </button>

      </div>{/*Error banner to help from blocking the page*/}
      {searchError && (
        <div className="error-banner">
          <p>{searchError}</p>
          <button onClick={() => { setSearchError(null); setSearchCity(""); }}>✕</button>
        </div>
      )}

      <div className="weather-container">

        {forecast.length > 0 && (
          <div className="forecast-container">
            <h2 className="forecast-Area">{searchResult?.location || defaultCity}</h2>
            <h2 className="forecast-title">7 Day Forecast</h2>
            <div className="forecast-row">
              {forecast.map((day, index) => (
                <div key={index} className="forecast-card">
                  <p className="forecast-date">{day.date}</p>
                  <p className="forecast-temp">{day.temp}°C</p>
                  <p className="forecast-condition">{day.condition}</p>
                  <p>💧 {day.humidity}%</p>
                  <p>💨 {day.windSpeed} km/h</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>

  );
}

export default WeatherApp;