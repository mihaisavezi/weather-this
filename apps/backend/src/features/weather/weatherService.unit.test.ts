// Unit test - tests weatherService directly
import { weatherService } from "./weatherService";
import { weatherApiClient } from "../../utils/httpClient";
import { describe, it, expect, beforeEach, vi } from "vitest";


// Mock the HTTP client
vi.mock("../../utils/httpClient");

describe("weatherService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should transform weather data correctly", async () => {
    // Arrange
    const mockApiResponse = {
      data: {
        name: "London",
        sys: { country: "GB" },
        main: { temp: 20, feels_like: 22, humidity: 65 },
        weather: [{ main: "Clear", description: "clear sky", icon: "01d" }],
        wind: { speed: 3.5 },
      },
    };

    // Mock the specific method you need
    vi.mocked(weatherApiClient.get).mockResolvedValue(mockApiResponse);

    // Act
    const result = await weatherService.getWeatherByCity("London");

    // Assert
    expect(result).toEqual({
      city: "London",
      country: "GB",
      temperature: 20,
      feelsLike: 22,
      condition: "Clear",
      description: "clear sky",
      humidity: 65,
      windSpeed: 3.5,
      icon: "01d",
      timestamp: expect.any(String),
    });
  });
});
