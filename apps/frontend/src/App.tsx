import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "./services/api";
import { formatTemperature } from "@weather-app/shared";
import { CitySearch } from "./components/CitySearch";
import type { CityOption } from "@weather-app/shared";

function App() {
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);

  const {
    data: weatherResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "weather",
      selectedCity?.name,
      selectedCity?.lat,
      selectedCity?.lon,
    ],
    staleTime: 10 * 60 * 1000,
    queryFn: () => weatherApi.getWeather(selectedCity?.name, selectedCity!.lat, selectedCity!.lon),
    enabled: !!selectedCity,
  });
    console.log("🚀 ~ App ~ error:", error)

  const handleCitySelect = (city: CityOption) => {
    setSelectedCity(city);
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{ textAlign: "center", color: "#2c3e50", marginBottom: "30px" }}
      >
        🌤️ Weather App
      </h1>

      {/* City Search */}
      <div style={{ marginBottom: "30px" }}>
        <CitySearch
          onCitySelect={handleCitySelect}
          placeholder="Search for a city (e.g., London, New York, Tokyo)..."
        />
      </div>

      {/* Current Selection */}
      {selectedCity && (
        <div
          style={{
            backgroundColor: "#e8f4fd",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #bee5eb",
          }}
        >
          <strong>Selected:</strong> {selectedCity.display}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <p>Loading weather data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #ef5350",
            textAlign: "center",
          }}
        >
          <h3>❌ Error</h3>
          <p>
            <strong>Message:</strong> {error.message}
          </p>
          <button
            onClick={() => refetch()}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#c62828",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Weather Display */}
      {weatherResponse?.success && weatherResponse.data && (
        <div
          style={{
            border: "1px solid #4caf50",
            padding: "30px",
            borderRadius: "12px",
            backgroundColor: "#f8fff8",
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: "0 0 20px 0", color: "#2c3e50" }}>
            📍 {weatherResponse.data.city}, {weatherResponse.data.country}
          </h2>

          <div
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              margin: "20px 0",
              color: "#3498db",
            }}
          >
            {formatTemperature(weatherResponse.data.temperature)}
          </div>

          <p
            style={{
              fontSize: "20px",
              margin: "10px 0",
              color: "#7f8c8d",
              textTransform: "capitalize",
            }}
          >
            {weatherResponse.data.description}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "20px",
              marginTop: "30px",
              textAlign: "left",
            }}
          >
            <div
              style={{
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "8px",
              }}
            >
              <strong>Feels like:</strong>
              <br />
              <span style={{ fontSize: "18px", color: "#3498db" }}>
                {formatTemperature(weatherResponse.data.feelsLike)}
              </span>
            </div>
            <div
              style={{
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "8px",
              }}
            >
              <strong>Humidity:</strong>
              <br />
              <span style={{ fontSize: "18px", color: "#3498db" }}>
                {weatherResponse.data.humidity}%
              </span>
            </div>
            <div
              style={{
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "8px",
              }}
            >
              <strong>Wind Speed:</strong>
              <br />
              <span style={{ fontSize: "18px", color: "#3498db" }}>
                {weatherResponse.data.windSpeed} m/s
              </span>
            </div>
            <div
              style={{
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "8px",
              }}
            >
              <strong>Updated:</strong>
              <br />
              <span style={{ fontSize: "14px", color: "#7f8c8d" }}>
                {new Date(weatherResponse.data.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
