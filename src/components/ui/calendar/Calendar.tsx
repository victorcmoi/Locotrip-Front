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
  selectableDates?: Date[];
  locale?: string;
  className?: string;
  showTitle?: boolean;
  title?: string;
  strikeThroughUnavailableDates?: boolean;
  monthsToShow?: number;
  dateHoverCounts?: Record<string, number>;
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
  selectableDates,
  locale = 'fr',
  className = '',
  showTitle = false,
  title = 'Disponibilité du guide',
  strikeThroughUnavailableDates = false,
  monthsToShow = 2,
  dateHoverCounts,
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

  const safeMonthsToShow = monthsToShow > 1 ? 2 : 1;
  const monthsToDisplay = Array.from({ length: safeMonthsToShow }, (_, index) =>
    currentMonth.add(index, 'month')
  );

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

  const isDateNotSelectable = (date: Dayjs) => {
    if (!selectableDates) return false;
    return !selectableDates.some(
      (selectableDate) =>
        dayjs(selectableDate).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    );
  };

  const isDateDisabled = (date: Dayjs) => {
    return isDateUnavailable(date) || isDateBeforeMin(date) || isDateAfterMax(date) || isDateNotSelectable(date);
  };

  const getDateHoverLabel = (date: Dayjs) => {
    const dateKey = date.format('YYYY-MM-DD');
    const count = dateHoverCounts?.[dateKey];

    if (!count) return undefined;

    const template = count === 1
      ? dict.calendar.availabilityCountSingular
      : dict.calendar.availabilityCountPlural;

    return template.replace('{count}', String(count));
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
      const unavailable = isDateUnavailable(date);
      const hoverLabel = getDateHoverLabel(date);

      const disabledClassName =
        strikeThroughUnavailableDates && unavailable
          ? 'text-gray-300 cursor-not-allowed line-through border-gray-200'
          : 'text-gray-300 cursor-not-allowed border-gray-200';

      days.push(
        <div key={day} className="relative group">
          <button
            onClick={() => handleDateClick(date)}
            disabled={disabled}
            aria-label={hoverLabel}
            className={`
              h-10 w-full rounded-3xl flex items-center justify-center text-sm font-medium
              transition-all duration-200 border bg-light px-2
              ${disabled 
                ? disabledClassName
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
          {hoverLabel && !disabled && (
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-dark px-3 py-1 text-xs font-medium text-white shadow-lg group-hover:block">
              {hoverLabel}
            </span>
          )}
        </div>
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

        <div className={`flex flex-1 ${safeMonthsToShow === 1 ? '' : 'gap-8'}`}>
          {monthsToDisplay.map((month, index) => (
            <React.Fragment key={`title-${index}`}>
              {renderMonthTitle(month, safeMonthsToShow === 2 && index === 1 ? 'right' : 'left')}
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
      <div className={`flex ${safeMonthsToShow === 1 ? '' : 'gap-8'}`}>
        {monthsToDisplay.map((month, index) => (
          <React.Fragment key={`calendar-${index}`}>{renderMonthCalendar(month)}</React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
