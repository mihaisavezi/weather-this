import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "../services/api";

export const useCities = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["cities", query],
    queryFn: () => weatherApi.searchCities(query),
    enabled: enabled && query.length >= 2, // Only search with 2+ characters
    staleTime: 30 * 60 * 1000, // 30 minutes for city data
    refetchOnWindowFocus: false,
  });
};
