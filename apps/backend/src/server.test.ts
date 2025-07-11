import { describe, it, expect, beforeAll } from "vitest";

const API_BASE_URL = "http://localhost:3001";

// Helper function to make API calls
const makeRequest = async (
  endpoint: string
): Promise<{ status: number; body: any }> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  const body = await response.json();
  return { status: response.status, body };
};

describe("Weather API Integration Tests", () => {
  beforeAll(async () => {
    // Wait a bit to ensure server is ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if server is running
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error("Server not responding");
      }
    } catch (error) {
      throw new Error(
        "Server must be running on http://localhost:3001 before running tests"
      );
    }
  });

  describe("Health Check", () => {
    it("should return OK status", async () => {
      const { status, body } = await makeRequest("/health");

      expect(status).toBe(200);
      expect(body).toMatchObject({
        status: "OK",
        service: "Weather API Backend",
      });
      expect(body.timestamp).toBeDefined();
    });
  });

  describe("Weather Endpoint - Error Cases", () => {
    it("should return error for missing parameters", async () => {
      const { status, body } = await makeRequest("/api/weather");

      expect(status).toBe(400);
      expect(body).toEqual({
        success: false,
        error: "MISSING_PARAMETERS",
        message: "Please provide either a city name or coordinates (lat, lon)",
      });
    });

    it("should return error for empty city parameter", async () => {
      const { status, body } = await makeRequest("/api/weather?city=");

      expect(status).toBe(400);
      expect(body).toEqual({
        success: false,
        error: "INVALID_CITY",
        message: "City name must be a non-empty string",
      });
    });

    it("should return error for invalid coordinates", async () => {
      const { status, body } = await makeRequest(
        "/api/weather?lat=invalid&lon=test"
      );

      expect(status).toBe(400);
      expect(body).toEqual({
        success: false,
        error: "INVALID_COORDINATES",
        message: "Latitude and longitude must be valid numbers",
      });
    });

    it("should return error for out-of-range coordinates", async () => {
      const { status, body } = await makeRequest(
        "/api/weather?lat=100&lon=200"
      );

      expect(status).toBe(400);
      expect(body).toEqual({
        success: false,
        error: "COORDINATES_OUT_OF_RANGE",
        message:
          "Latitude must be between -90 and 90, longitude between -180 and 180",
      });
    });
  });

  describe("Weather Endpoint - Success Cases", () => {
    it("should return weather data for valid city", async () => {
      const { status, body } = await makeRequest("/api/weather?city=London");

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        city: "London",
        country: "US",
        condition: "Sunny",
        description: "Clear sky",
        icon: "01d",
      });
      expect(body.data.temperature).toBeTypeOf("number");
      expect(body.data.humidity).toBeTypeOf("number");
      expect(body.data.windSpeed).toBeTypeOf("number");
      expect(body.data.timestamp).toBeDefined();
      expect(body.message).toBe("Weather data retrieved successfully");
    });

    it("should return weather data for valid coordinates", async () => {
      const { status, body } = await makeRequest(
        "/api/weather?lat=40.7128&lon=-74.0060"
      );

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        city: "Current Location",
        country: "US",
        condition: "Sunny",
        description: "Clear sky",
        icon: "01d",
      });
      expect(body.data.temperature).toBeTypeOf("number");
      expect(body.message).toBe("Weather data retrieved successfully");
    });

    it("should handle city names with spaces", async () => {
      const { status, body } = await makeRequest(
        "/api/weather?city=New%20York"
      );

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.city).toBe("New York");
    });

    it("should handle city names with special characters", async () => {
      const { status, body } = await makeRequest(
        "/api/weather?city=São%20Paulo"
      );

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.city).toBe("São Paulo");
    });
  });

  describe("404 Handling", () => {
    it("should return 404 for unknown endpoints", async () => {
      const { status, body } = await makeRequest("/api/nonexistent");

      expect(status).toBe(404);
      expect(body).toEqual({
        success: false,
        error: "Endpoint not found",
        message: "The endpoint /api/nonexistent does not exist",
      });
    });
  });

  describe("Data Validation", () => {
    it("should return consistent data structure", async () => {
      const { status, body } = await makeRequest("/api/weather?city=TestCity");

      expect(status).toBe(200);
      expect(body).toHaveProperty("success", true);
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("message");

      const weatherData = body.data;
      expect(weatherData).toHaveProperty("city");
      expect(weatherData).toHaveProperty("country");
      expect(weatherData).toHaveProperty("temperature");
      expect(weatherData).toHaveProperty("feelsLike");
      expect(weatherData).toHaveProperty("condition");
      expect(weatherData).toHaveProperty("description");
      expect(weatherData).toHaveProperty("humidity");
      expect(weatherData).toHaveProperty("windSpeed");
      expect(weatherData).toHaveProperty("icon");
      expect(weatherData).toHaveProperty("timestamp");
    });

    it("should return fixed values for mock data", async () => {
      const { body } = await makeRequest("/api/weather?city=TestCity");

      // Your server returns fixed values, so we test for those
      expect(body.data.temperature).toBe(72);
      expect(body.data.feelsLike).toBe(75);
      expect(body.data.humidity).toBe(65);
      expect(body.data.windSpeed).toBe(5.2);
    });
  });
});
