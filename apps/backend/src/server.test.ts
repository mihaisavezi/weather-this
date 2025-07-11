import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./server";

describe("Weather API with Zod Validation", () => {
  describe("Weather Endpoint Validation", () => {
    it("should validate city name length", async () => {
      const response = await request(app)
        .get("/api/weather?city=A")
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: "VALIDATION_ERROR",
        message: expect.stringContaining(
          "City name must be at least 2 characters"
        ),
      });
    });

    it("should validate city name characters", async () => {
      const response = await request(app)
        .get("/api/weather?city=123$%^")
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: "VALIDATION_ERROR",
        message: expect.stringContaining(
          "City name contains invalid characters"
        ),
      });
    });

    it("should validate coordinate ranges", async () => {
      const response = await request(app)
        .get("/api/weather?lat=100&lon=200")
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: "VALIDATION_ERROR",
        message: expect.stringContaining("Latitude must be between -90 and 90"),
      });
    });

    it("should accept valid city names", async () => {
      const response = await request(app)
        .get("/api/weather?city=New York")
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should accept valid coordinates", async () => {
      const response = await request(app)
        .get("/api/weather?lat=40.7128&lon=-74.0060")
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe("Cities Endpoint Validation", () => {
    it("should validate query length", async () => {
      const response = await request(app)
        .get("/api/cities?query=A")
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: "VALIDATION_ERROR",
        message: expect.stringContaining(
          "Search query must be at least 2 characters"
        ),
      });
    });

    it("should validate limit range", async () => {
      const response = await request(app)
        .get("/api/cities?query=London&limit=15")
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: "VALIDATION_ERROR",
        message: expect.stringContaining("Limit cannot exceed 10"),
      });
    });

    it("should use default limit when not provided", async () => {
      const response = await request(app)
        .get("/api/cities?query=London")
        .expect(200);

      expect(response.body.success).toBe(true);
      // The default limit of 5 should be applied
    });
  });
});
