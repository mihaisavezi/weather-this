import axios from "axios";
import { createRetryInterceptor } from "../middleware/retry";

// Create a configured axios instance for OpenWeatherMap
export const weatherApiClient = axios.create({
  baseURL:
    process.env.OPENWEATHER_BASE_URL ||
    "https://api.openweathermap.org/data/2.5",
  timeout: 10000,
});

export const geocodingApiClient = axios.create({
  baseURL: "http://api.openweathermap.org/geo/1.0",
  timeout: 5000,
  headers: {
    "User-Agent": "Weather-App/1.0",
  },
});


// Apply retry middleware to both clients
const retryInterceptor = createRetryInterceptor({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 8000,
  retryCondition: (error) => {
    // Don't retry on authentication errors or client errors (except rate limiting)
    if (error.response) {
      const status = error.response.status;
      return status >= 500 || status === 429; // Server errors or rate limiting
    }
    // Retry on network errors
    return true;
  },
});

retryInterceptor(weatherApiClient);
retryInterceptor(geocodingApiClient);

// Add request interceptor to include API key
const addApiKey = (config: any) => {
  if (!config.params) {
    config.params = {};
  }
  config.params.appid = process.env.OPENWEATHER_API_KEY;
  return config;
};

weatherApiClient.interceptors.request.use(addApiKey);
geocodingApiClient.interceptors.request.use(addApiKey);
