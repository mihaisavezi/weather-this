import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./server"; // Import your actual app!

describe("Weather API Integration Tests", () => {
  
    describe("Health Check", () => {
      it("should return OK status", async () => {
        const response = await request(app)
          .get("/health")
          .expect(200);
  
        expect(response.body).toMatchObject({
          status: "OK",
          service: "Weather API Backend",
        });
        expect(response.body.timestamp).toBeDefined();
      });
    });
  
    describe("Weather Endpoint - Error Cases", () => {
      it("should return error for missing parameters", async () => {
        const response = await request(app)
          .get("/api/weather")
          .expect(400);
  
        expect(response.body).toEqual({
          success: false,
          error: "MISSING_PARAMETERS",
          message: "Please provide either a city name or coordinates (lat, lon)",
        });
      });
  
      it("should return error for empty city parameter", async () => {
        const response = await request(app)
          .get("/api/weather?city=")
          .expect(400);
  
        expect(response.body).toEqual({
          success: false,
          error: "INVALID_CITY",
          message: "City name must be a non-empty string",
        });
      });
  
      it("should return error for invalid coordinates", async () => {
        const response = await request(app)
          .get("/api/weather?lat=invalid&lon=test")
          .expect(400);
  
        expect(response.body).toEqual({
          success: false,
          error: "INVALID_COORDINATES",
          message: "Latitude and longitude must be valid numbers",
        });
      });
  
      it("should return error for out-of-range coordinates", async () => {
        const response = await request(app)
          .get("/api/weather?lat=100&lon=200")
          .expect(400);
  
        expect(response.body).toEqual({
          success: false,
          error: "COORDINATES_OUT_OF_RANGE",
          message:
            "Latitude must be between -90 and 90, longitude between -180 and 180",
        });
      });
    });
  
    describe("Weather Endpoint - Success Cases", () => {
      it("should return weather data for valid city", async () => {
        const response = await request(app)
          .get("/api/weather?city=London")
          .expect(200);
  
        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          city: "London",
          country: "US",
          condition: "Sunny",
          description: "Clear sky",
          icon: "01d",
        });
        expect(response.body.data.temperature).toBeTypeOf("number");
        expect(response.body.data.humidity).toBeTypeOf("number");
        expect(response.body.data.windSpeed).toBeTypeOf("number");
        expect(response.body.data.timestamp).toBeDefined();
        expect(response.body.message).toBe("Weather data retrieved successfully");
      });
  
      it("should return weather data for valid coordinates", async () => {
        const response = await request(app)
          .get("/api/weather?lat=40.7128&lon=-74.0060")
          .expect(200);
  
        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          city: "Current Location",
          country: "US",
          condition: "Sunny",
          description: "Clear sky",
          icon: "01d",
        });
        expect(response.body.data.temperature).toBeTypeOf("number");
        expect(response.body.message).toBe("Weather data retrieved successfully");
      });
  
      it("should handle city names with spaces", async () => {
        const response = await request(app)
          .get("/api/weather")
          .query({ city: "New York" })
          .expect(200);
  
        expect(response.body.success).toBe(true);
        expect(response.body.data.city).toBe("New York");
      });
  
      it("should handle city names with special characters", async () => {
        const response = await request(app)
          .get("/api/weather")
          .query({ city: "São Paulo" })
          .expect(200);
  
        expect(response.body.success).toBe(true);
        expect(response.body.data.city).toBe("São Paulo");
      });
    });
  
    describe("404 Handling", () => {
      it("should return 404 for unknown endpoints", async () => {
        const response = await request(app)
          .get("/api/nonexistent")
          .expect(404);
  
        expect(response.body).toEqual({
          success: false,
          error: "Endpoint not found",
          message: "The endpoint /api/nonexistent does not exist",
        });
      });
    });
  
    describe("Data Validation", () => {
      it("should return consistent data structure", async () => {
        const response = await request(app)
          .get("/api/weather?city=TestCity")
          .expect(200);
  
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("message");
  
        const weatherData = response.body.data;
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
  
      it("should return fixed mock values", async () => {
        const response = await request(app)
          .get("/api/weather?city=TestCity")
          .expect(200);
  
        // Test the fixed mock values
        expect(response.body.data.temperature).toBe(72);
        expect(response.body.data.feelsLike).toBe(75);
        expect(response.body.data.humidity).toBe(65);
        expect(response.body.data.windSpeed).toBe(5.2);
      });
    });
});
  

