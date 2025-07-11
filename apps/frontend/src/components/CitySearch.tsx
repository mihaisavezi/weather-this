import React, { useState, useRef, useEffect } from "react";
import { useCities } from "../hooks/useCities";
import { useDebounce } from "../hooks/useDebounce";
import type { CityOption } from "@weather-app/shared";

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

  const debouncedQuery = useDebounce(query, 300);

  const {
    data: citiesResponse,
    isLoading,
    error,
  } = useCities(debouncedQuery, debouncedQuery.length >= 2);

  const cities = citiesResponse?.data || [];

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
    setTimeout(() => setIsOpen(false), 150);
  };

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

  const isTyping = query !== debouncedQuery && query.length >= 2;

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input pl-10 pr-12"
        />

        {/* Loading indicator */}
        {(isLoading || isTyping) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-weather-primary"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && query.length >= 2 && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {error ? (
            <div className="px-4 py-3 text-center text-red-600">
              <p className="text-sm">
                Error searching cities. Please try again.
              </p>
            </div>
          ) : isLoading || isTyping ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <p className="text-sm">Searching...</p>
            </div>
          ) : cities.length > 0 ? (
            cities.map((city, index) => (
              <button
                key={`${city.name}-${city.country}-${city.lat}-${city.lon}`}
                onClick={() => handleCitySelect(city)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                  selectedIndex === index ? "bg-blue-50 border-blue-200" : ""
                }`}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0">
                    📍
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{city.name}</div>
                    <div className="text-sm text-gray-500">
                      {city.state ? `${city.state}, ` : ""}
                      {city.country}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-gray-500">
              <p className="text-sm">No cities found for "{debouncedQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
