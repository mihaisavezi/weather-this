import type { WeatherResponse } from "@weather-app/shared";

const API_BASE_URL = "http://localhost:3001";

export class WeatherApiError extends Error {
  constructor(message: string, public code: string, public status: number) {
    super(message);
    this.name = "WeatherApiError";
  }
}

export const weatherApi = {
  async getWeather(
    city?: string,
    lat?: number,
    lon?: number
  ): Promise<WeatherResponse> {
    let url = `${API_BASE_URL}/api/weather`;

    if (city) {
      url += `?city=${encodeURIComponent(city)}`;
    } else if (lat !== undefined && lon !== undefined) {
      url += `?lat=${lat}&lon=${lon}`;
    }

    const response = await fetch(url);
    const data: WeatherResponse = await response.json();

    if (!response.ok) {
      throw new WeatherApiError(
        data.message || "Failed to fetch weather data",
        data.error || "UNKNOWN_ERROR",
        response.status
      );
    }

    return data;
  },
};
