// Export all types
export * from "./types/weather";
export * from "./types/cities";

// Export utility functions (we'll add these later)
export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°C`;
};
