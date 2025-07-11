import React, { useState, useRef, useEffect } from "react";
import { useCities } from "../hooks/useCities";
import type { CityOption } from "@weather-app/shared";
import { useDebounce } from "../hooks/useDebounce";

interface CitySearchProps {
  onCitySelect: (city: CityOption) => void;
  placeholder?: string;
}

export const CitySearch: React.FC<CitySearchProps> = ({
  onCitySelect,
  placeholder = "Search for a city...",
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Debounce the query with a 300ms delay
  const debouncedQuery = useDebounce(query, 300);

  const {
    data: citiesResponse,
    isLoading,
    error,
  } = useCities(debouncedQuery, debouncedQuery.length >= 2);
  const cities = citiesResponse?.data || [];

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || cities.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < cities.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : cities.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && cities[selectedIndex]) {
          handleCitySelect(cities[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleCitySelect = (city: CityOption) => {
    console.log("🚀 ~ handleCitySelect ~ city:", city);
    setQuery(city.display);
    setIsOpen(false);
    setSelectedIndex(-1);
    onCitySelect(city);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(value.length >= 2);
  };

  const handleInputFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow clicks on dropdown items
    setTimeout(() => setIsOpen(false), 150);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        listRef.current &&
        !listRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Search Input */}
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "2px solid #ddd",
            borderRadius: "8px",
            fontSize: "16px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3498db";
            handleInputFocus();
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ddd";
            handleInputBlur();
          }}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "20px",
              height: "20px",
              border: "2px solid #f3f3f3",
              borderTop: "2px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && query.length >= 2 && (
        <div
          ref={listRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            maxHeight: "300px",
            overflowY: "auto",
            marginTop: "4px",
          }}
        >
          {error ? (
            <div
              style={{
                padding: "12px 16px",
                color: "#e74c3c",
                textAlign: "center",
              }}
            >
              Error searching cities. Please try again.
            </div>
          ) : isLoading ? (
            <div
              style={{
                padding: "12px 16px",
                color: "#7f8c8d",
                textAlign: "center",
              }}
            >
              Searching...
            </div>
          ) : cities.length > 0 ? (
            cities.map((city, index) => (
              <div
                key={`${city.name}-${city.country}-${city.lat}-${city.lon}`}
                onClick={() => handleCitySelect(city)}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  borderBottom:
                    index < cities.length - 1 ? "1px solid #f0f0f0" : "none",
                  backgroundColor:
                    selectedIndex === index ? "#f8f9fa" : "white",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div style={{ fontWeight: "500", color: "#2c3e50" }}>
                  {city.name}
                </div>
                <div style={{ fontSize: "14px", color: "#7f8c8d" }}>
                  {city.state ? `${city.state}, ` : ""}
                  {city.country}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "12px 16px",
                color: "#7f8c8d",
                textAlign: "center",
              }}
            >
              No cities found for "{query}"
            </div>
          )}
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
