'use client';

import React, { useState, useRef, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/de';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import { useTranslations } from '@/providers/i18n.provider';

export interface CalendarProps {
  mode?: 'single' | 'range';
  selectedDate?: Date | null;
  selectedRange?: { start: Date | null; end: Date | null };
  onChange?: (date: Date | { start: Date | null; end: Date | null }) => void;
  onClose?: () => void;
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
  onClose,
  unavailableDates = [],
  minDate,
  maxDate,
  locale = 'fr',
  className = '',
  showTitle = false,
  title = 'Disponibilité du guide',
}) => {
  const dict = useTranslations();
  const [currentMonth, setCurrentMonth] = useState(dayjs().locale(locale));
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

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
      return (date.isAfter(dayjs(start), 'day') || date.isSame(dayjs(start), 'day')) && 
             (date.isBefore(dayjs(end), 'day') || date.isSame(dayjs(end), 'day'));
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

  const renderMonthTitle = (month: Dayjs, align: 'left' | 'right' = 'left') => {
    return (
      <div className="flex-1">
        <h3 className={`font-semibold capitalize text-dark ${align === 'right' ? 'text-right' : 'text-left'}`}>
          {month.format('MMMM YYYY')}
        </h3>
      </div>
    );
  };

  const renderMonthCalendar = (month: Dayjs) => {
    const startOfMonth = month.startOf('month');
    const startDay = startOfMonth.day() === 0 ? 6 : startOfMonth.day() - 1;
    const daysInMonth = month.daysInMonth();

    const days = [];
    const weekDays = [
      dict.calendar.monday,
      dict.calendar.tuesday,
      dict.calendar.wednesday,
      dict.calendar.thursday,
      dict.calendar.friday,
      dict.calendar.saturday,
      dict.calendar.sunday
    ];

    const dayHeaders = weekDays.map((day, index) => (
      <div key={`header-${index}`} className="text-center text-xs font-medium text-gray-700">
        {day}
      </div>
    ));

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = month.date(day);
      const disabled = isDateDisabled(date);
      const selected = isDateSelected(date);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={disabled}
          className={`
            h-10 rounded-3xl flex items-center justify-center text-sm font-medium
            transition-all duration-200 border bg-light px-2
            ${disabled 
              ? 'text-gray-300 cursor-not-allowed line-through border-gray-200' 
              : 'text-gray-800 hover:bg-gray-100 cursor-pointer border-accent'
            }
            ${selected && !disabled 
              ? 'bg-accent! text-white hover:bg-accent/90 border-accent'
              : ''
            }
          `}
        >
          {day}
        </button>
      );
    }

    const totalCells = startDay + daysInMonth;
    const remainingCells = 42 - totalCells;
    for (let i = 0; i < remainingCells; i++) {
      days.push(<div key={`empty-end-${i}`} className="h-10" />);
    }

    return (
      <div className="flex-1">
        <div className="overflow-hidden">
          <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
            <div className="grid grid-cols-7 gap-2">
              {dayHeaders}
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {days}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={calendarRef} className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-4 z-50 bg-light rounded-3xl p-6 shadow-2xl border border-gray-200 w-[95vw] max-w-4xl ${className}`}>
      {showTitle && (
        <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>
      )}
      
      {/* En-tête avec flèches et titres */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handlePrevious}
          className="p-4 rounded-full bg-light flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm border border-gray-500 cursor-pointer"
          aria-label={dict.calendar.previousMonth}
        >
          <SlArrowLeft className="text-gray-700" size={12} />
        </button>

        <div className="flex gap-8 flex-1">
          {monthsToDisplay.map((month, index) => (
            <React.Fragment key={`title-${index}`}>
              {renderMonthTitle(month, index === 1 ? 'right' : 'left')}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-4 rounded-full bg-light flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm border border-gray-500 cursor-pointer"
          aria-label={dict.calendar.nextMonth}
        >
          <SlArrowRight className="text-gray-700" size={12} />
        </button>
      </div>

      {/* Calendriers */}
      <div className="flex gap-8">
        {monthsToDisplay.map((month, index) => (
          <React.Fragment key={`calendar-${index}`}>{renderMonthCalendar(month)}</React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
