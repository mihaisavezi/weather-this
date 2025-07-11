import React from "react";
import { useGeolocation } from "../hooks/useGeoLocation";

interface LocationButtonProps {
  onLocationDetected: (coords: { lat: number; lon: number }) => void;
  disabled?: boolean;
}

export const LocationButton: React.FC<LocationButtonProps> = ({
  onLocationDetected,
  disabled = false,
}) => {
  const { coords, loading, error, supported, getCurrentLocation, clearError } =
    useGeolocation();

  React.useEffect(() => {
    if (coords) {
      onLocationDetected(coords);
    }
  }, [coords, onLocationDetected]);

  const handleClick = () => {
    clearError();
    getCurrentLocation();
  };

  if (!supported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-5 w-5 text-yellow-600">📍</div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              Geolocation is not supported by your browser
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className="btn-secondary w-full flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
            <span>Detecting location...</span>
          </>
        ) : (
          <>
            <div className="w-5 h-5">📍</div>
            <span>Use Current Location</span>
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">
                Location Error
              </h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
