import { geocodingApiClient, weatherApiClient } from "../../utils/httpClient";
import type { CityOption } from "@weather-app/shared";

interface OpenWeatherGeoResponse {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export class CitiesServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "CitiesServiceError";
  }
}

export const citiesService = {
  async searchCities(query: string, limit: number = 5): Promise<CityOption[]> {
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new CitiesServiceError(
        "OpenWeather API key not configured",
        500,
        false
      );
    }

    if (!query || query.trim().length < 2) {
      throw new CitiesServiceError(
        "Query must be at least 2 characters long",
        400,
        false
      );
    }

    try {
      const response = await geocodingApiClient.get<OpenWeatherGeoResponse[]>(
        "/direct",
        {
          params: {
            q: query.trim(),
            limit: Math.min(limit, 5),
          },
        }
      );

      return response.data.map(this.transformCityData);
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  },

  handleApiError(error: any): CitiesServiceError {
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          return new CitiesServiceError("Invalid API key", 401, false);
        case 429:
          return new CitiesServiceError("Rate limit exceeded", 429, true);
        default:
          return new CitiesServiceError(
            "Cities service error",
            status,
            status >= 500
          );
      }
    }

    if (error.code === "ECONNABORTED") {
      return new CitiesServiceError("Request timeout", 408, true);
    }

    return new CitiesServiceError("Failed to search cities", 500, true);
  },

  transformCityData(data: OpenWeatherGeoResponse): CityOption {
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
