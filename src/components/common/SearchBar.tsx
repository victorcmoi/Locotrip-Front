"use client";

import { useState } from "react";
import { useTranslations } from "@/providers/i18n.provider";
import { LuMapPin } from "react-icons/lu";
import { BsCalendar2 } from "react-icons/bs";
import { HiMagnifyingGlass } from "react-icons/hi2";
import Calendar from "@/components/ui/calendar/Calendar";
import { Location } from "@/components/ui/location/Location";
import { City } from "@/schemas/city";

interface SearchBarProps {
  onSearch: (params: {
    location: string;
    selectedCity: City | null;
    dateRange: { start: Date | null; end: Date | null };
  }) => void;
  initialLocation?: string;
  initialDateRange?: { start: Date | null; end: Date | null };
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialLocation = "",
  initialDateRange = { start: null, end: null },
  className = "",
}) => {
  const dict = useTranslations();
  const [location, setLocation] = useState<string>(initialLocation);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [searchDate, setSearchDate] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showLocation, setShowLocation] = useState<boolean>(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>(initialDateRange);

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
    onSearch({
      location,
      selectedCity,
      dateRange: selectedDateRange,
    });
  };

  return (
    <div className={`relative ${className}`}>
      <form
        onSubmit={handleSearch}
        className="w-full flex items-center bg-light rounded-full shadow-lg pl-6 text-black"
      >
        <LuMapPin size={24} className="text-gray shrink-0" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onFocus={() => setShowLocation(true)}
          placeholder={dict.home.searchPlace}
          className="grow px-4 py-2 md:py-3 bg-transparent border-none rounded-full focus:outline-none placeholder:text-dark"
        />

        <BsCalendar2 size={24} className="text-gray shrink-0" />
        <input
          type="text"
          value={searchDate}
          onClick={() => setShowCalendar(!showCalendar)}
          readOnly
          placeholder={dict.home.searchDate}
          className="grow px-4 py-2 md:py-3 bg-transparent border-none rounded-full focus:outline-none placeholder:text-dark cursor-pointer"
        />

        <button
          type="submit"
          className="bg-accent text-light p-4 rounded-full hover:bg-accent-dark transition-colors duration-300 cursor-pointer flex items-center justify-center shrink-0"
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
        />
      )}
    </div>
  );
};
