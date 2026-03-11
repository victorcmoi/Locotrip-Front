"use client";

import { useTranslations } from "@/providers/i18n.provider";
import { useRef, useEffect, useState, useCallback } from "react";

interface DurationHistogramProps {
  minDuration: number | undefined;
  maxDuration: number | undefined;
  onMinDurationChange: (value: number | undefined) => void;
  onMaxDurationChange: (value: number | undefined) => void;
}

const DURATION_RANGES = [
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1 h", value: 60 },
  { label: "1,5 h", value: 90 },
  { label: "2 h", value: 120 },
  { label: "3 h", value: 180 },
  { label: "4 h et plus", value: 240 },
];

export const DurationHistogram: React.FC<DurationHistogramProps> = ({
  minDuration,
  maxDuration,
  onMinDurationChange,
  onMaxDurationChange,
}) => {
  const dict = useTranslations();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  const getIndexForValue = (value: number | undefined) => {
    if (!value) return 0;
    const index = DURATION_RANGES.findIndex(r => r.value === value);
    return index >= 0 ? index : 0;
  };

  const minIndex = getIndexForValue(minDuration);
  const maxIndex = getIndexForValue(maxDuration) || DURATION_RANGES.length - 1;
  const minPercent = (minIndex / DURATION_RANGES.length) * 100;
  const maxPercent = ((maxIndex + 1) / DURATION_RANGES.length) * 100;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const rawIndex = Math.round((x / rect.width) * (DURATION_RANGES.length - 1));

    if (isDragging === 'min') {
      const currentMax = getIndexForValue(maxDuration) || DURATION_RANGES.length - 1;
      const newIndex = Math.max(0, Math.min(rawIndex, currentMax));
      onMinDurationChange(DURATION_RANGES[newIndex].value);
    } else if (isDragging === 'max') {
      const currentMin = getIndexForValue(minDuration);
      const newIndex = Math.max(currentMin, Math.min(rawIndex, DURATION_RANGES.length - 1));
      onMaxDurationChange(DURATION_RANGES[newIndex].value);
    }
  }, [isDragging, minDuration, maxDuration, onMinDurationChange, onMaxDurationChange]);

  const handleMouseUp = useCallback(() => setIsDragging(null), []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="space-y-4 select-none">
      <div className="text-sm text-gray-600">{dict.search.durationInMinutes}</div>

      <div className="px-2 py-8">
        <div className="relative">
          <div ref={trackRef} className="relative flex items-center gap-1" style={{ height: '4px' }}>
            {DURATION_RANGES.map((range, index) => (
              <div
                key={range.value}
                className={`h-full rounded-full transition-all duration-200 ${
                  index >= minIndex && index <= maxIndex ? 'bg-accent' : 'bg-gray-300'
                }`}
                style={{ flex: 1 }}
              />
            ))}

            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-accent rounded-full cursor-grab active:cursor-grabbing shadow-md hover:scale-125 transition-all duration-200 z-10"
              style={{ left: `${minPercent}%` }}
              onMouseDown={() => setIsDragging('min')}
            />

            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-accent rounded-full cursor-grab active:cursor-grabbing shadow-md hover:scale-125 transition-all duration-200 z-10"
              style={{ left: `${maxPercent}%` }}
              onMouseDown={() => setIsDragging('max')}
            />
          </div>

          <div className="relative flex gap-1 mt-3 pointer-events-none">
            {DURATION_RANGES.map((range) => (
              <div key={range.value} className="flex items-center justify-center" style={{ flex: 1 }}>
                <span className="text-xs text-gray-600 whitespace-nowrap">{range.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
