import axios from "axios";
import type { WeatherData } from "@weather-app/shared";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL =
process.env.OPENWEATHER_BASE_URL;

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
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "WeatherServiceError";
  }
}

export const weatherService = {
  async getWeatherByCity(city: string, lat?: number, lon?: number): Promise<WeatherData> {
    console.log("🚀 ~ getWeatherByCity ~ city:", city)
    if (!OPENWEATHER_API_KEY) {
      throw new WeatherServiceError("OpenWeather API key not configured");
    }

    try {
      const response = await axios.get<OpenWeatherResponse>(
        `${OPENWEATHER_BASE_URL}/find`,
        {
          params: {
            q: city,
            lat,
            lon,
            appid: OPENWEATHER_API_KEY,
            units: "metric"
          },
          timeout: 10000, // 10 second timeout
        }
      );

      return this.transformWeatherData({city, data: response.data});
    } catch (error) {
        console.log("🚀 ~ getWeatherByCity ~ error:", error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new WeatherServiceError(`City "${city}" not found`, 404);
        }
        if (error.response?.status === 401) {
          throw new WeatherServiceError("Invalid API key", 401);
        }
        if (error.code === "ECONNABORTED") {
          throw new WeatherServiceError(
            "Request timeout - weather service unavailable",
            408
          );
        }
      }
      throw new WeatherServiceError("Failed to fetch weather data");
    }
  },

  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    if (!OPENWEATHER_API_KEY) {
      throw new WeatherServiceError("OpenWeather API key not configured");
    }

    try {
      const response = await axios.get<OpenWeatherResponse>(
        `${OPENWEATHER_BASE_URL}/weather`,
        {
          params: {
            lat,
            lon,
            appid: OPENWEATHER_API_KEY,
            units: "metric",
          },
          timeout: 10000,
        }
      );

      return this.transformWeatherData({data:response.data});
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new WeatherServiceError("Invalid coordinates", 400);
        }
        if (error.response?.status === 401) {
          throw new WeatherServiceError("Invalid API key", 401);
        }
      }
      throw new WeatherServiceError("Failed to fetch weather data");
    }
  },

  transformWeatherData({city, data}: {city?: string, data: OpenWeatherResponse}): WeatherData {
    if(data.list && data.list.length > 0 && city) {
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
