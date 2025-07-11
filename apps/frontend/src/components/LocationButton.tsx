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
      <div
        style={{
          padding: "12px",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "8px",
          color: "#856404",
          fontSize: "14px",
        }}
      >
        📍 Geolocation is not supported by your browser
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          backgroundColor: loading ? "#6c757d" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: disabled || loading ? "not-allowed" : "pointer",
          transition: "background-color 0.2s",
          width: "100%",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.backgroundColor = "#218838";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.backgroundColor = "#28a745";
          }
        }}
      >
        {loading ? (
          <>
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid #ffffff",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            Detecting location...
          </>
        ) : (
          <>📍 Use Current Location</>
        )}
      </button>

      {error && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "8px",
            color: "#721c24",
            fontSize: "14px",
          }}
        >
          <strong>Location Error:</strong> {error}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
