"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUpdateBooking } from "@/services/bookings/updateBooking";
import { ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";

interface BookingStatusBadgeProps {
  bookingId: string;
  currentStatus: string;
  onStatusUpdated?: () => void;
}

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "En attente",
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-800",
    dotClass: "bg-yellow-500",
  },
  {
    value: "confirmed",
    label: "Confirmé",
    bgClass: "bg-green-100",
    textClass: "text-green-800",
    dotClass: "bg-green-500",
  },
  {
    value: "completed",
    label: "Terminé",
    bgClass: "bg-blue-100",
    textClass: "text-blue-800",
    dotClass: "bg-blue-500",
  },
  {
    value: "cancelled",
    label: "Annulé",
    bgClass: "bg-red-100",
    textClass: "text-red-800",
    dotClass: "bg-red-500",
  },
];

export default function BookingStatusBadge({
  bookingId,
  currentStatus,
  onStatusUpdated,
}: BookingStatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { mutate: updateBooking, isPending } = useUpdateBooking();

  const currentStatusOption =
    STATUS_OPTIONS.find((option) => option.value === currentStatus) ||
    STATUS_OPTIONS[0];

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
          toast.success("Statut de la réservation mis à jour");
        },
        onError: (error) => {
          console.error("Erreur lors de la mise à jour du statut:", error);
          toast.error("Erreur lors de la mise à jour du statut");
        },
      },
    );
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`inline-flex items-center text-left gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm transition-all ${
          currentStatusOption.bgClass
        } ${currentStatusOption.textClass} ${
          isPending
            ? "opacity-50 cursor-not-allowed"
            : "hover:opacity-90 cursor-pointer"
        }`}
      >
        {isPending ? (
          <>
            <div
              className={`inline-block animate-spin rounded-full h-3 w-3 border-2 border-t-transparent border-current`}
            ></div>
            <span>Mise à jour...</span>
          </>
        ) : (
          <>
            <span className="whitespace-nowrap">
              {currentStatusOption.label}
            </span>
            <ChevronDownIcon className="h-3 w-3" />
          </>
        )}
      </button>

      {isOpen && !isPending && (
        <div className="absolute z-50 mt-2 w-40 rounded-lg bg-white shadow-lg border border-gray-light overflow-hidden left-0">
          {STATUS_OPTIONS.map((option) => (
            <div
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                option.value === currentStatus
                  ? `${option.bgClass} ${option.textClass}`
                  : "text-dark hover:bg-gray-light/60"
              }`}
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
