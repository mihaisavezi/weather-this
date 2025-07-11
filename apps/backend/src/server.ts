import "dotenv/config";
import express, {type Express} from "express";
import cors from "cors";
import type {
  WeatherResponse,
  WeatherData,
  CitiesResponse,
} from "@weather-app/shared";
import {
  weatherService,
  WeatherServiceError,
} from "./features/weather/weatherService";
import {
  citiesService,
  CitiesServiceError,
} from "./features/cities/citiesService";
import { validateQuery, ValidatedRequest } from "./middleware/validation";
import {
  weatherRequestSchema,
  type WeatherRequest,
} from "./features/weather/weatherSchemas";
import {
  CitiesSearchRequest,
  citiesSearchSchema,
} from "./features/cities/citiesSchemas";

const app: Express = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Weather endpoint with Zod validation
app.get(
  "/api/weather",
  validateQuery(weatherRequestSchema),
  async (req: ValidatedRequest<WeatherRequest>, res) => {
    try {
      const { validatedData } = req;
      let weatherData: WeatherData;

      if ("city" in validatedData) {
        // City-based weather request
        weatherData = await weatherService.getWeatherByCity(validatedData.city);
      } else {
        // Coordinate-based weather request
        weatherData = await weatherService.getWeatherByCoords(
          validatedData.lat,
          validatedData.lon
        );
      }

      const response: WeatherResponse = {
        success: true,
        data: weatherData,
        message: "Weather data retrieved successfully",
      };

      console.log(`✅ Weather data sent for: ${weatherData.city}`);
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
  }
);

// Cities endpoint with Zod validation
app.get(
  "/api/cities",
  validateQuery(citiesSearchSchema),
  async (req: ValidatedRequest<CitiesSearchRequest>, res) => {
    try {
      const { query, limit } = req.validatedData;

      const cities = await citiesService.searchCities(query, limit);

      const response: CitiesResponse = {
        success: true,
        data: cities,
        message: `Found ${cities.length} cities matching "${query}"`,
      };

      console.log(
        `✅ Cities search: "${query}" returned ${cities.length} results`
      );
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
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "ENDPOINT_NOT_FOUND",
    message: `The endpoint ${req.originalUrl} does not exist`,
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Weather API Backend",
    environment: process.env.NODE_ENV || "development",
  });
});

app.listen(PORT, () => {
  console.log(`🌤️ Weather API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// for testing
export { app };
