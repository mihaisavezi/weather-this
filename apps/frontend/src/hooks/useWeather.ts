import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "../services/api";

export const useWeather = () => {
  return useQuery({
    queryKey: ["weather"],
    queryFn: weatherApi.getWeather,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
};
