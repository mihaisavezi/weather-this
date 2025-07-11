import { z } from "zod";

// Base schemas for reusable validation
export const cityNameSchema = z
  .string()
  .min(2, "City name must be at least 2 characters")
  .max(100, "City name must be less than 100 characters")
  .regex(/^[a-zA-Z\s\-'\.]+$/, "City name contains invalid characters");

export const latitudeSchema = z
  .number()
  .min(-90, "Latitude must be between -90 and 90")
  .max(90, "Latitude must be between -90 and 90");

export const longitudeSchema = z
  .number()
  .min(-180, "Longitude must be between -180 and 180")
  .max(180, "Longitude must be between -180 and 180");

// Weather request validation schemas
export const weatherByCitySchema = z.object({
  city: cityNameSchema,
});

export const weatherByCoordinatesSchema = z.object({
  lat: latitudeSchema,
  lon: longitudeSchema,
});

export const weatherRequestSchema = z.union([
  weatherByCitySchema,
  weatherByCoordinatesSchema,
]);



// Type inference from schemas
export type WeatherByCityRequest = z.infer<typeof weatherByCitySchema>;
export type WeatherByCoordinatesRequest = z.infer<
  typeof weatherByCoordinatesSchema
>;
export type WeatherRequest = z.infer<typeof weatherRequestSchema>;

