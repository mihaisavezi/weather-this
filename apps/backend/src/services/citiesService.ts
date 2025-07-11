import axios from "axios";
import type { CityOption } from "@weather-app/shared";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const GEOCODING_BASE_URL = "http://api.openweathermap.org/geo/1.0";

interface OpenWeatherGeoResponse {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  local_names?: Record<string, string>;
}

export class CitiesServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "CitiesServiceError";
  }
}

export const citiesService = {
  async searchCities(query: string, limit: number = 5): Promise<CityOption[]> {
    if (!OPENWEATHER_API_KEY) {
      throw new CitiesServiceError("OpenWeather API key not configured");
    }

    if (!query || query.trim().length < 2) {
      throw new CitiesServiceError(
        "Query must be at least 2 characters long",
        400
      );
    }

    try {
      const response = await axios.get<OpenWeatherGeoResponse[]>(
        `${GEOCODING_BASE_URL}/direct`,
        {
          params: {
            q: query.trim(),
            limit: Math.min(limit, 5), // OpenWeather max is 5
            appid: OPENWEATHER_API_KEY,
          },
          timeout: 5000, // 5 second timeout
        }
      );

      return response.data.map(this.transformCityData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new CitiesServiceError("Invalid API key", 401);
        }
        if (error.code === "ECONNABORTED") {
          throw new CitiesServiceError(
            "Request timeout - cities service unavailable",
            408
          );
        }
      }
      throw new CitiesServiceError("Failed to fetch city suggestions");
    }
  },

  transformCityData(data: OpenWeatherGeoResponse): CityOption {
    // Create a formatted display name
    let display = data.name;
    if (data.state) {
      display += `, ${data.state}`;
    }
    display += `, ${data.country}`;

    return {
      name: data.name,
      country: data.country,
      state: data.state,
      lat: data.lat,
      lon: data.lon,
      display,
    };
  },
};
