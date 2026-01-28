'use client';

import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';

export interface CalendarProps {
  mode?: 'single' | 'range';
  selectedDate?: Date | null;
  selectedRange?: { start: Date | null; end: Date | null };
  onChange?: (date: Date | { start: Date | null; end: Date | null }) => void;
  unavailableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
  className?: string;
  showTitle?: boolean;
  title?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  mode = 'single',
  selectedDate,
  selectedRange,
  onChange,
  unavailableDates = [],
  minDate,
  maxDate,
  locale = 'fr',
  className = '',
  showTitle = false,
  title = 'Disponibilité du guide',
}) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().locale(locale));

  const monthsToDisplay = [currentMonth, currentMonth.add(1, 'month')];

  const handlePrevious = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const handleNext = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  const isDateUnavailable = (date: Dayjs) => {
    return unavailableDates.some(
      (unavailableDate) =>
        dayjs(unavailableDate).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    );
  };

  const isDateBeforeMin = (date: Dayjs) => {
    return minDate && date.isBefore(dayjs(minDate), 'day');
  };

  const isDateAfterMax = (date: Dayjs) => {
    return maxDate && date.isAfter(dayjs(maxDate), 'day');
  };

  const isDateDisabled = (date: Dayjs) => {
    return isDateUnavailable(date) || isDateBeforeMin(date) || isDateAfterMax(date);
  };

  const isDateSelected = (date: Dayjs) => {
    if (mode === 'single' && selectedDate) {
      return date.format('YYYY-MM-DD') === dayjs(selectedDate).format('YYYY-MM-DD');
    }
    if (mode === 'range' && selectedRange) {
      const { start, end } = selectedRange;
      if (!start) return false;
      if (!end) {
        return date.format('YYYY-MM-DD') === dayjs(start).format('YYYY-MM-DD');
      }
      return date.isSameOrAfter(dayjs(start), 'day') && date.isSameOrBefore(dayjs(end), 'day');
    }
    return false;
  };

  const isDateRangeStart = (date: Dayjs) => {
    if (mode === 'range' && selectedRange?.start) {
      return date.format('YYYY-MM-DD') === dayjs(selectedRange.start).format('YYYY-MM-DD');
    }
    return false;
  };

  const isDateRangeEnd = (date: Dayjs) => {
    if (mode === 'range' && selectedRange?.end) {
      return date.format('YYYY-MM-DD') === dayjs(selectedRange.end).format('YYYY-MM-DD');
    }
    return false;
  };

  const handleDateClick = (date: Dayjs) => {
    if (isDateDisabled(date)) return;

    if (mode === 'single') {
      onChange?.(date.toDate());
    } else if (mode === 'range') {
      if (!selectedRange?.start || (selectedRange.start && selectedRange.end)) {
        onChange?.({ start: date.toDate(), end: null });
      } else {
        const start = dayjs(selectedRange.start);
        if (date.isBefore(start)) {
          onChange?.({ start: date.toDate(), end: start.toDate() });
        } else {
          onChange?.({ start: start.toDate(), end: date.toDate() });
        }
      }
    }
  };

  const renderMonth = (month: Dayjs) => {
    const startOfMonth = month.startOf('month');
    const endOfMonth = month.endOf('month');
    const startDay = startOfMonth.day() === 0 ? 6 : startOfMonth.day() - 1; // Lundi = 0
    const daysInMonth = month.daysInMonth();

    const days = [];
    const weekDays = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];

    const dayHeaders = weekDays.map((day, index) => (
      <div key={`header-${index}`} className="text-center text-xs font-medium text-gray-700">
        {day}
      </div>
    ));

    // Cases vides avant le premier jour du mois
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = month.date(day);
      const disabled = isDateDisabled(date);
      const selected = isDateSelected(date);
      const rangeStart = isDateRangeStart(date);
      const rangeEnd = isDateRangeEnd(date);
      const inRange = selected && mode === 'range' && !rangeStart && !rangeEnd;

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={disabled}
          className={`
            aspect-square rounded-full flex items-center justify-center text-sm font-medium
            transition-all duration-200 border bg-light
            ${disabled 
              ? 'text-gray-300 cursor-not-allowed line-through border-gray-200' 
              : 'text-gray-800 hover:bg-gray-100 cursor-pointer border-accent'
            }
            ${selected && !disabled 
              ? rangeStart || rangeEnd || mode === 'single'
                ? 'bg-accent text-white hover:bg-accent/90 border-accent'
                : 'bg-accent/20 border-accent'
              : ''
            }
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="flex-1">
        <h3 className="text-center text-xs font-semibold text-gray-800 mb-3 capitalize">
          {month.format('MMMM YYYY')}
        </h3>
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-white/50 border-b border-gray-200 px-4 py-3">
            <div className="grid grid-cols-7 gap-2">
              {dayHeaders}
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2 min-h-[240px]">
              {days}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-light rounded-3xl p-6 ${className}`}>
      {showTitle && (
        <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>
      )}
      
      <div className="relative">
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-0 p-4  rounded-full bg-light flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm z-10 border border-gray-500 cursor-pointer"
          aria-label="Mois précédent"
        >
          <SlArrowLeft className="text-gray-700" size={12} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-0 top-0 p-4 rounded-full bg-light flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm z-10 border border-gray-500 cursor-pointer"
          aria-label="Mois suivant"
        >
          <SlArrowRight className="text-gray-700" size={12} />
        </button>

        {/* Deux mois */}
        <div className="flex gap-8 px-16">
          {monthsToDisplay.map((month, index) => (
            <React.Fragment key={index}>{renderMonth(month)}</React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
