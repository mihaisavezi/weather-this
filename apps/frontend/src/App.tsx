import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "./services/api";
import { formatTemperature } from "@weather-app/shared";
import { CitySearch } from "./components/CitySearch";
import { LocationButton } from "./components/LocationButton";
import type { CityOption } from "@weather-app/shared";

interface LocationState {
  type: "city" | "coords" | null;
  city?: CityOption;
  coords?: { lat: number; lon: number };
}

function App() {
  const [location, setLocation] = useState<LocationState>({ type: null });
  const [autoLocationAttempted, setAutoLocationAttempted] = useState(false);

  const handleCitySelect = useCallback((city: CityOption) => {
    setLocation({
      type: "city",
      city,
    });
  }, []);

  const handleLocationDetected = useCallback(
    (coords: { lat: number; lon: number }) => {
      setLocation({
        type: "coords",
        coords,
      });
    },
    []
  );

  const {
    data: weatherResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "weather",
      location.type,
      location.city?.name,
      location.coords?.lat,
      location.coords?.lon,
    ],
    queryFn: () => {
      if (location.type === "city" && location.city) {
        return weatherApi.getWeather(
          location.city.name,
          location.city.lat,
          location.city.lon
        );
      } else if (location.type === "coords" && location.coords) {
        return weatherApi.getWeather(
          undefined,
          location.coords.lat,
          location.coords.lon
        );
      }
      throw new Error("No location selected");
    },
    enabled: location.type !== null,
    staleTime: 10 * 60 * 1000,
  });

  // Auto-detect location on app load
  useEffect(() => {
    if (!autoLocationAttempted && "geolocation" in navigator) {
      setAutoLocationAttempted(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            type: "coords",
            coords: {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            },
          });
        },
        (error) => {
          console.log("Auto-geolocation failed:", error.message);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000,
        }
      );
    }
  }, [autoLocationAttempted]);

  const getCurrentLocationDisplay = () => {
    if (location.type === "city" && location.city) {
      return location.city.display;
    } else if (location.type === "coords") {
      return `Current Location (${location.coords?.lat.toFixed(
        4
      )}, ${location.coords?.lon.toFixed(4)})`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 ">
          <h1 className="text-5xl font-bold text-weather-secondary mb-4">
            🌤️ Weather App
          </h1>
          <p className="text-gray-600 text-lg">
            Get real-time weather information for any location
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="space-y-6">
            {/* City Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by City
              </label>
              <CitySearch
                onCitySelect={handleCitySelect}
                placeholder="Search for a city (e.g., London, New York, Tokyo)..."
              />
            </div>

            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500 bg-white">OR</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Location Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use Current Location
              </label>
              <LocationButton
                onLocationDetected={handleLocationDetected}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Current Selection Display */}
        {getCurrentLocationDisplay() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  Current Location: {getCurrentLocationDisplay()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-weather-primary mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Getting Weather Data
              </h3>
              <p className="text-gray-500">Loading weather information...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-red-600 text-2xl">⚠️</div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Something went wrong
              </h3>

              <p className="text-gray-600 mb-6">
                {error.message ||
                  "Unable to load weather data. Please try again."}
              </p>

              <button
                onClick={() => refetch()}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* No Location Selected */}
        {!location.type && !isLoading && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-6">🌍</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                Get Weather Information
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Search for a city above or use your current location to see
                detailed weather data
              </p>
            </div>
          </div>
        )}

        {/* Weather Display */}
        {weatherResponse?.success && weatherResponse.data && (
          <div className="weather-card">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
                {weatherResponse.data.city}, {weatherResponse.data.country}
              </h2>
            </div>

            {/* Main Temperature */}
            <div className="text-center mb-10">
              <div className="text-8xl font-light mb-4">
                {formatTemperature(weatherResponse.data.temperature)}
              </div>
              <p className="text-blue-100 capitalize text-2xl mb-2">
                {weatherResponse.data.description}
              </p>
              <p className="text-blue-200 text-lg">
                Feels like {formatTemperature(weatherResponse.data.feelsLike)}
              </p>
            </div>

            {/* Weather Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[--spacing-weather-gap]">
              <div className="weather-stat">
                <div className="text-blue-200 text-sm font-medium mb-2">
                  Humidity
                </div>
                <p className="text-2xl font-bold">
                  {weatherResponse.data.humidity}%
                </p>
              </div>

              <div className="weather-stat">
                <div className="text-blue-200 text-sm font-medium mb-2">
                  Wind Speed
                </div>
                <p className="text-2xl font-bold">
                  {weatherResponse.data.windSpeed} m/s
                </p>
              </div>

              <div className="weather-stat">
                <div className="text-blue-200 text-sm font-medium mb-2">
                  Feels Like
                </div>
                <p className="text-2xl font-bold">
                  {formatTemperature(weatherResponse.data.feelsLike)}
                </p>
              </div>

              <div className="weather-stat">
                <div className="text-blue-200 text-sm font-medium mb-2">
                  Condition
                </div>
                <p className="text-lg font-semibold capitalize">
                  {weatherResponse.data.condition}
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-center text-blue-200 text-sm">
                Last updated:{" "}
                {new Date(weatherResponse.data.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
