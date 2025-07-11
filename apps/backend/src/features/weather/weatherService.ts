import { weatherApiClient } from "../../utils/httpClient";
import type { WeatherData } from "@weather-app/shared";

interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
  sys: {
    country: string;
  };
}

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "WeatherServiceError";
  }
}

export const weatherService = {
  async getWeatherByCity(city: string): Promise<WeatherData> {
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new WeatherServiceError(
        "OpenWeather API key not configured",
        500,
        false
      );
    }

    try {
      const response = await weatherApiClient.get<OpenWeatherResponse>(
        "/weather",
        {
          params: {
            q: city,
            units: "metric",
          },
        }
      );

      return this.transformWeatherData({city, data: response.data});
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  },

  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new WeatherServiceError(
        "OpenWeather API key not configured",
        500,
        false
      );
    }

    try {
      const response = await weatherApiClient.get<OpenWeatherResponse>(
        "/weather",
        {
          params: {
            lat,
            lon,
            units: "metric",
          },
        }
      );


      return this.transformWeatherData({data:response.data});
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  },

  handleApiError(error: any): WeatherServiceError {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          return new WeatherServiceError("Invalid API key", 401, false);
        case 404:
          return new WeatherServiceError("Location not found", 404, false);
        case 429:
          return new WeatherServiceError("Rate limit exceeded", 429, true);
        default:
          return new WeatherServiceError(
            data?.message || "Weather service error",
            status,
            status >= 500
          );
      }
    }

    // Network errors
    if (error.code === "ECONNABORTED") {
      return new WeatherServiceError("Request timeout", 408, true);
    }

    return new WeatherServiceError("Failed to fetch weather data", 500, true);
  },

  transformWeatherData({
    city,
    data,
  }: {
    city?: string;
    data: OpenWeatherResponse;
  }): WeatherData {
    if (data.list && data.list.length > 0 && city) {
      data = data.list.find((item) => item.name === city);
    }
    return {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 10) / 10, // Round to 1 decimal
      icon: data.weather[0].icon,
      timestamp: new Date().toISOString(),
    };
  },
};

