"use client";

import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { Calendar } from "./Calendar";

export interface DatePickerInputProps {
  mode?: "single" | "range";
  value?: Date | null;
  rangeValue?: { start: Date | null; end: Date | null };
  onChange?: (date: Date | { start: Date | null; end: Date | null }) => void;
  unavailableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  mode = "single",
  value,
  rangeValue,
  onChange,
  unavailableDates = [],
  minDate,
  maxDate,
  locale = "fr",
  placeholder = "Sélectionner une date",
  label,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getDisplayValue = () => {
    if (mode === "single" && value) {
      return dayjs(value).locale(locale).format("DD MMMM YYYY");
    }
    if (mode === "range" && rangeValue) {
      const { start, end } = rangeValue;
      if (start && end) {
        return `${dayjs(start).locale(locale).format("DD MMM")} - ${dayjs(end).locale(locale).format("DD MMM YYYY")}`;
      }
      if (start) {
        return dayjs(start).locale(locale).format("DD MMMM YYYY");
      }
    }
    return placeholder;
  };

  const handleChange = (
    date: Date | { start: Date | null; end: Date | null },
  ) => {
    onChange?.(date);
    if (mode === "single") {
      setIsOpen(false);
    }
    if (
      mode === "range" &&
      typeof date === "object" &&
      "start" in date &&
      date.start &&
      date.end
    ) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-left hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
      >
        <div className="flex items-center justify-between">
          <span
            className={
              value || rangeValue?.start ? "text-gray-900" : "text-gray-400"
            }
          >
            {getDisplayValue()}
          </span>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 shadow-2xl rounded-3xl overflow-hidden">
          <Calendar
            mode={mode}
            selectedDate={value}
            selectedRange={rangeValue}
            onChange={handleChange}
            unavailableDates={unavailableDates}
            minDate={minDate}
            maxDate={maxDate}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
};

export default DatePickerInput;
