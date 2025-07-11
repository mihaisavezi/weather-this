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
    console.log(`🚀 ~ app.get ~ { city, lat, lon }:`, { city, lat, lon })

    // Validate input
    if (!city && (!lat || !lon)) {
      const response: WeatherResponse = {
        success: false,
        error: "Missing required parameters",
        message: "Please provide either a city name or coordinates (lat, lon)",
      };
      return res.status(400).json(response);
    }

    // Validate city name if provided
    if (city && typeof city !== "string") {
      const response: WeatherResponse = {
        success: false,
        error: "Invalid city parameter",
        message: "City name must be a valid string",
      };
      return res.status(400).json(response);
    }

    // Validate coordinates if provided
    if ((lat || lon) && (isNaN(Number(lat)) || isNaN(Number(lon)))) {
      const response: WeatherResponse = {
        success: false,
        error: "Invalid coordinates",
        message: "Latitude and longitude must be valid numbers",
      };
      return res.status(400).json(response);
    }

    // Mock weather data (will be replaced with real API)
    const mockWeather: WeatherData = {
      city: (city as string) || "Current Location",
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
    console.error("Weather API Error:", error);

    const response: WeatherResponse = {
      success: false,
      error: "Failed to fetch weather data",
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
