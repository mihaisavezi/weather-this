import { useState, useCallback } from "react";

interface GeolocationCoords {
  lat: number;
  lon: number;
}

interface GeolocationState {
  coords: GeolocationCoords | null;
  loading: boolean;
  error: string | null;
  supported: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: false,
    error: null,
    supported: "geolocation" in navigator,
  });

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by this browser",
        supported: false,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,       maximumAge: 300000,     };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          loading: false,
          error: null,
          supported: true,
        });
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions or search for a city manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is unavailable. Please try searching for a city.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "Location request timed out. Please try again or search for a city.";
            break;
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      },
      options
    );
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      coords: null,
      loading: false,
      error: null,
      supported: "geolocation" in navigator,
    });
  }, []);

  return {
    ...state,
    getCurrentLocation,
    clearError,
    reset,
  };
};
