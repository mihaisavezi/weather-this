import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import type { WeatherResponse, WeatherData } from "@weather-app/shared";

dotenv.config();

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

// Weather endpoint with error handling
app.get("/api/weather", async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    // Check if we have any parameters at all
    const hasCityParam = city !== undefined;
    const hasCoordParams = lat !== undefined && lon !== undefined;

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
    if (hasCityParam && (typeof city !== "string" || city.trim().length === 0)) {
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

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        const response: WeatherResponse = {
          success: false,
          error: "COORDINATES_OUT_OF_RANGE",
          message: "Latitude must be between -90 and 90, longitude between -180 and 180",
        };
        return res.status(400).json(response);
      }
    }

    // If we reach here, we have valid parameters
    const hasValidCity = hasCityParam && typeof city === "string" && city.trim().length > 0;

    // Rest of your logic...
    const mockWeather: WeatherData = {
      city: hasValidCity ? (city as string) : "Current Location",
      country: "US",
      temperature: 72,
      feelsLike: 75,
      condition: "Sunny",
      description: "Clear sky",
      humidity: 65,
      windSpeed: 5.2,
      icon: "01d",
      timestamp: new Date().toISOString(),
    };

    const response: WeatherResponse = {
      success: true,
      data: mockWeather,
      message: "Weather data retrieved successfully",
    };

    res.json(response);
  } catch (error) {
    // Error handling...
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
