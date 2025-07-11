import "dotenv/config";
import express from "express";
import cors from "cors";
import type { WeatherResponse, CitiesResponse, } from "@weather-app/shared";
import { weatherService, WeatherServiceError } from "./services/weatherService";
import { citiesService, CitiesServiceError } from "./services/citiesService";


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - `);
  next();
});

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Server Error:", err.message);

    const response: WeatherResponse = {
      success: false,
      error: "Internal server error",
      message: "Something went wrong on our end. Please try again later.",
    };

    res.status(500).json(response);
  }
);

// Cities autocomplete endpoint
app.get("/api/cities", async (req, res) => {
  try {
    const { query, limit } = req.query;

    // Validate query parameter
    if (!query || typeof query !== "string") {
      const response: CitiesResponse = {
        success: false,
        error: "MISSING_QUERY",
        message: "Query parameter is required",
      };
      return res.status(400).json(response);
    }

    if (query.trim().length < 2) {
      const response: CitiesResponse = {
        success: false,
        error: "QUERY_TOO_SHORT",
        message: "Query must be at least 2 characters long",
      };
      return res.status(400).json(response);
    }

    // Parse limit parameter
    const searchLimit = limit ? parseInt(limit as string, 10) : 5;
    if (isNaN(searchLimit) || searchLimit < 1 || searchLimit > 5) {
      const response: CitiesResponse = {
        success: false,
        error: "INVALID_LIMIT",
        message: "Limit must be a number between 1 and 5",
      };
      return res.status(400).json(response);
    }

    // Search for cities
    const cities = await citiesService.searchCities(query.trim(), searchLimit);

    const response: CitiesResponse = {
      success: true,
      data: cities,
      message: `Found ${cities.length} cities matching "${query}"`,
    };

    console.log(`✅ Cities search: "${query}" returned ${cities.length} results`);
    res.json(response);

  } catch (error) {
    console.error("❌ Cities API Error:", error);

    if (error instanceof CitiesServiceError) {
      const statusCode = error.statusCode || 500;
      const response: CitiesResponse = {
        success: false,
        error: "CITIES_SERVICE_ERROR",
        message: error.message,
      };
      return res.status(statusCode).json(response);
    }

    const response: CitiesResponse = {
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Unable to search for cities. Please try again.",
    };

    res.status(500).json(response);
  }
});

// Weather endpoint with error handling
app.get("/api/weather", async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    // Check if we have any parameters at all
    const hasCityParam = city !== undefined;
    const hasCoordParams = lat !== undefined && lon !== undefined;

    console.log("🚀 ~ app.get ~ hasCityParam:", hasCityParam);

    // If no parameters provided at all
    if (!hasCityParam && !hasCoordParams) {
      const response: WeatherResponse = {
        success: false,
        error: "MISSING_PARAMETERS",
        message: "Please provide either a city name or coordinates (lat, lon)",
      };
      return res.status(400).json(response);
    }

    // If city parameter is provided but invalid (empty string)
    if (
      hasCityParam &&
      (typeof city !== "string" || city.trim().length === 0)
    ) {
      const response: WeatherResponse = {
        success: false,
        error: "INVALID_CITY",
        message: "City name must be a non-empty string",
      };
      return res.status(400).json(response);
    }

    // Validate coordinates if provided
    if (hasCoordParams) {
      const latitude = Number(lat);
      const longitude = Number(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        const response: WeatherResponse = {
          success: false,
          error: "INVALID_COORDINATES",
          message: "Latitude and longitude must be valid numbers",
        };
        return res.status(400).json(response);
      }

      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        const response: WeatherResponse = {
          success: false,
          error: "COORDINATES_OUT_OF_RANGE",
          message:
            "Latitude must be between -90 and 90, longitude between -180 and 180",
        };
        return res.status(400).json(response);
      }
    }

    // Fetch real weather data
    let weatherData;
    if (hasCityParam && typeof city === "string" && city.trim().length > 0) {
      weatherData = await weatherService.getWeatherByCity(city.trim(), Number(lat), Number(lon));
    } else if (hasCoordParams) {
      weatherData = await weatherService.getWeatherByCoords(
        Number(lat),
        Number(lon)
      );
    }

    const response: WeatherResponse = {
      success: true,
      data: weatherData,
      message: "Weather data retrieved successfully",
    };

    console.log(`✅ Weather data sent for: ${weatherData?.city}`);
    res.json(response);
  } catch (error) {
    console.error("❌ Weather API Error:", error);

    if (error instanceof WeatherServiceError) {
      const statusCode = error.statusCode || 500;
      const response: WeatherResponse = {
        success: false,
        error: "WEATHER_SERVICE_ERROR",
        message: error.message,
      };
      return res.status(statusCode).json(response);
    }

    const response: WeatherResponse = {
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Unable to retrieve weather information. Please try again.",
    };

    res.status(500).json(response);
  }
});



// Health check with error handling
app.get("/health", (req, res) => {
  try {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "Weather API Backend",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Health check failed",
    });
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    message: `The endpoint ${req.originalUrl} does not exist`,
  });
});

app.listen(PORT, () => {
  console.log(`🌤️ Weather API server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

// Export the app for testing
export { app };
