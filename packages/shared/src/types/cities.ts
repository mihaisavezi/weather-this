// New city autocomplete types
export interface CityOption {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  display: string; // Formatted display name like "London, England, GB"
}

export interface CitiesResponse {
  success: boolean;
  data?: CityOption[];
  error?: string;
  message?: string;
}
