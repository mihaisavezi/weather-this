import { useWeather } from "./hooks/useWeather";
import { formatTemperature } from "@weather-app/shared";

function App() {
  const { data: weatherResponse, isLoading, error } = useWeather();

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Weather App</h1>
        <p>Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Weather App</h1>
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #ef5350",
          }}
        >
          <p>
            <strong>Error:</strong> {error.message}
          </p>
          <p>Make sure your backend is running on http://localhost:3001</p>
        </div>
      </div>
    );
  }

  if (!weatherResponse?.success || !weatherResponse.data) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Weather App</h1>
        <p>No weather data available</p>
      </div>
    );
  }

  const weather = weatherResponse.data;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Weather App</h1>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: "#f8f9fa",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ margin: "0 0 15px 0", color: "#2c3e50" }}>
          {weather.city}, {weather.country}
        </h2>

        <div
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            margin: "10px 0",
            color: "#3498db",
          }}
        >
          {formatTemperature(weather.temperature)}
        </div>

        <p style={{ fontSize: "18px", margin: "5px 0", color: "#7f8c8d" }}>
          {weather.condition} - {weather.description}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <div>
            <strong>Feels like:</strong>
            <br />
            {formatTemperature(weather.feelsLike)}
          </div>
          <div>
            <strong>Humidity:</strong>
            <br />
            {weather.humidity}%
          </div>
          <div>
            <strong>Wind Speed:</strong>
            <br />
            {weather.windSpeed} m/s
          </div>
          <div>
            <strong>Updated:</strong>
            <br />
            {new Date(weather.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
