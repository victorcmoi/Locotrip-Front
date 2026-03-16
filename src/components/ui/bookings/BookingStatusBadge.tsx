"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUpdateBooking } from "@/services/bookings/updateBooking";
import { ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "@/providers/i18n.provider";

interface BookingStatusBadgeProps {
  bookingId: string;
  currentStatus: string;
  canEdit?: boolean;
  onStatusUpdated?: () => void;
}

const TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export default function BookingStatusBadge({
  bookingId,
  currentStatus,
  onStatusUpdated,
  canEdit,
}: BookingStatusBadgeProps) {
  const dict = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { mutate: updateBooking, isPending } = useUpdateBooking();

  const statusOptions = [
    {
      value: "pending",
      label: dict.bookings.filterPending,
      bgClass: "bg-yellow-100",
      textClass: "text-yellow-800",
      dotClass: "bg-yellow-500",
    },
    {
      value: "confirmed",
      label: dict.bookings.filterConfirmed,
      bgClass: "bg-green-100",
      textClass: "text-green-800",
      dotClass: "bg-green-500",
    },
    {
      value: "completed",
      label: dict.bookings.filterCompleted,
      bgClass: "bg-blue-100",
      textClass: "text-blue-800",
      dotClass: "bg-blue-500",
    },
    {
      value: "cancelled",
      label: dict.bookings.filterCancelled,
      bgClass: "bg-red-100",
      textClass: "text-red-800",
      dotClass: "bg-red-500",
    },
  ];

  const currentStatusOption =
    statusOptions.find((option) => option.value === currentStatus) ||
    statusOptions[0];

  const allowedTransitions = TRANSITIONS[currentStatus] || [];
  const isInteractable = canEdit && allowedTransitions.length > 0 && !isPending;

  const visibleOptions = statusOptions.filter((option) =>
    allowedTransitions.includes(option.value),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
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

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    updateBooking(
      { id: bookingId, data: { status: newStatus } },
      {
        onSuccess: () => {
          setIsOpen(false);
          if (onStatusUpdated) onStatusUpdated();
          toast.success(dict.bookings.statusUpdatedSuccess);
        },
        onError: () => {
          toast.error(dict.bookings.statusUpdatedError);
        },
      },
    );
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => isInteractable && setIsOpen(!isOpen)}
        disabled={isPending || !isInteractable}
        className={`inline-flex items-center text-left gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm transition-all ${
          currentStatusOption.bgClass
        } ${currentStatusOption.textClass} ${
          isInteractable
            ? "hover:opacity-90 cursor-pointer"
            : "cursor-default"
        } ${isPending ? "opacity-50" : ""}`}
      >
        {isPending ? (
          <>
            <div
              className={`inline-block animate-spin rounded-full h-3 w-3 border-2 border-t-transparent border-current`}
            ></div>
            <span>{dict.bookings.updating}</span>
          </>
        ) : (
          <>
            <span className="whitespace-nowrap">
              {currentStatusOption.label}
            </span>
            {isInteractable && <ChevronDownIcon className="h-3 w-3" />}
          </>
        )}
      </button>

      {isOpen && isInteractable && (
        <div className="absolute z-50 mt-2 w-40 rounded-lg bg-white shadow-lg border border-gray-light overflow-hidden left-0">
          {visibleOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-dark hover:bg-gray-light/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${option.dotClass}`}
                ></span>
                <span>{option.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
