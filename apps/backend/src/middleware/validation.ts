import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import type { WeatherResponse, CitiesResponse } from "@weather-app/shared";

export interface ValidatedRequest<T> extends Request {
  validatedData: T;
}

export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convert string query parameters to appropriate types
      const queryData = { ...req.query };

      // Convert numeric strings to numbers for lat/lon
      if (queryData.lat) queryData.lat = Number(queryData.lat);
      if (queryData.lon) queryData.lon = Number(queryData.lon);
      if (queryData.limit) queryData.limit = Number(queryData.limit);

      const validatedData = schema.parse(queryData);
      (req as ValidatedRequest<T>).validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse: WeatherResponse | CitiesResponse = {
          success: false,
          error: "VALIDATION_ERROR",
          message: formatZodError(error),
        };
        return res.status(400).json(errorResponse);
      }

      // Handle unexpected errors
      const errorResponse: WeatherResponse | CitiesResponse = {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Validation failed due to an unexpected error",
      };
      return res.status(500).json(errorResponse);
    }
  };
};

const formatZodError = (error: ZodError): string => {
  const issues = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
    return `${path}${issue.message}`;
  });

  return issues.length === 1
    ? issues[0]
    : `Multiple validation errors: ${issues.join(", ")}`;
};
