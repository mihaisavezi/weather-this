// Export all types
export * from "./types/weather";

// Export utility functions (we'll add these later)
export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°F`;
};
