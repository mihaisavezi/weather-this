// Core weather data structure
export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  timestamp: string;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Specific response types
export type WeatherResponse = ApiResponse<WeatherData>;

// Request types
export interface WeatherRequest {
  city?: string;
  lat?: number;
  lon?: number;
}
