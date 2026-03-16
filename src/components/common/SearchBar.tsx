"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "@/providers/i18n.provider";
import { LuMapPin } from "react-icons/lu";
import { BsCalendar2 } from "react-icons/bs";
import { HiMagnifyingGlass } from "react-icons/hi2";
import Calendar from "@/components/ui/calendar/Calendar";
import { Location } from "@/components/ui/location/Location";
import { City } from "@/schemas/city";

interface SearchBarProps {
  onSearch: (params: {
    mode: "guide" | "activity";
    location: string;
    selectedCity: City | null;
    dateRange: { start: Date | null; end: Date | null };
  }) => void;
  currentMode?: "guide" | "activity";
  showModeButtons?: boolean;
  onModeChange?: (mode: "guide" | "activity") => void;
  initialLocation?: string;
  initialDateRange?: { start: Date | null; end: Date | null };
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  currentMode = "guide",
  showModeButtons = true,
  onModeChange,
  initialLocation = "",
  initialDateRange = { start: null, end: null },
  className = "",
}) => {
  const dict = useTranslations();
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState<string>(initialLocation);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [searchDate, setSearchDate] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showLocation, setShowLocation] = useState<boolean>(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>(initialDateRange);
  const [selectedMode, setSelectedMode] = useState<"guide" | "activity">(currentMode);

  useEffect(() => {
    setSelectedMode(currentMode);
  }, [currentMode]);

  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    setSelectedDateRange(initialDateRange);
    if (initialDateRange.start && initialDateRange.end) {
      setSearchDate(
        `${initialDateRange.start.toLocaleDateString()} - ${initialDateRange.end.toLocaleDateString()}`
      );
    } else if (initialDateRange.start) {
      setSearchDate(initialDateRange.start.toLocaleDateString());
    } else {
      setSearchDate("");
    }
  }, [initialDateRange]);

  const handleDateRangeChange = (range: {
    start: Date | null;
    end: Date | null;
  }) => {
    setSelectedDateRange(range);
    if (range.start && range.end) {
      setSearchDate(
        `${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}`
      );
    }
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setLocation(city.name);
    setShowLocation(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const defaultCity: City = {
      id: "default-paris",
      name: "Paris",
      country: "France",
      slug: "paris-france",
      is_active: true,
      is_suggested: true,
      created_at: new Date(),
    };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const finalCity = selectedCity || defaultCity;
    const finalLocation = location || "Paris";
    const finalDateRange = {
      start: selectedDateRange.start || today,
      end: selectedDateRange.end || null,
    };
    
    onSearch({
      mode: selectedMode,
      location: finalLocation,
      selectedCity: finalCity,
      dateRange: finalDateRange,
    });
  };

  return (
      <div className={`relative ${className}`}>
        {showModeButtons && (
          <nav className="flex justify-center mb-8 md:mb-12">
            <button
              onClick={() => {
                setSelectedMode("guide");
                onModeChange?.("guide");
              }}
              className={`px-8 sm:px-15 py-3 rounded-full cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 ${
                selectedMode === "guide"
                  ? "bg-accent text-light"
                  : "bg-light text-dark"
              }`}
            >
              {dict.home.localGuide}
            </button>
            <button
              onClick={() => {
                setSelectedMode("activity");
                onModeChange?.("activity");
              }}
              className={`px-10 sm:px-18 py-3 rounded-full -ml-6 sm:-ml-10 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 ${
                selectedMode === "activity"
                  ? "bg-accent text-light"
                  : "bg-light text-dark"
              }`}
            >
              {dict.home.activity}
            </button>
          </nav>
        )}
        <form
            onSubmit={handleSearch}
            className="w-full flex items-center bg-light rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] pl-6 text-black"
          >
            <LuMapPin size={24} className="text-dark shrink-0" />
            <input
              ref={locationInputRef}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setShowLocation(true)}
              placeholder={dict.home.searchPlace}
              className="grow px-4 py-2 md:py-3 bg-transparent border-none rounded-full focus:outline-none placeholder:text-gray-500"
            />

            <BsCalendar2 size={24} className="text-dark shrink-0" />
            <input
              type="text"
              value={searchDate}
              onClick={() => setShowCalendar(!showCalendar)}
              readOnly
              placeholder={dict.home.searchDate}
              className="grow px-4 py-2 md:py-3 bg-transparent border-none rounded-full focus:outline-none placeholder:text-gray-500 cursor-pointer"
            />

            <button
              type="submit"
              className="bg-accent text-light p-4 rounded-full hover:bg-accent-dark hover:scale-110 transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0"
            >
              <HiMagnifyingGlass size={24} />
            </button>
          </form>

          {showCalendar && (
            <Calendar
              mode="range"
              selectedRange={selectedDateRange}
              onChange={(range) =>
                handleDateRangeChange(
                  range as { start: Date | null; end: Date | null }
                )
              }
              onClose={() => setShowCalendar(false)}
              locale="fr"
            />
          )}

          {showLocation && (
            <Location
              selectedCity={selectedCity}
              onChange={handleCitySelect}
              onClose={() => setShowLocation(false)}
              searchQuery={location}
              ignoreRef={locationInputRef}
            />
          )}
      </div>
  );
};
