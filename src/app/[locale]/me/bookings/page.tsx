"use client";

import React from "react";
import { useSession } from "next-auth/react";
import {
  useGuideProfile,
  useGuideBookings,
} from "@/services/bookings/getBookings";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { BsThreeDotsVertical } from "react-icons/bs";

dayjs.locale("fr");

const BookingStatusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: "En Attente de réponse", color: "text-primary" },
  confirmed: { label: "Confirmé", color: "text-green-600" },
  completed: { label: "Terminé", color: "text-blue-600" },
  cancelled: { label: "Annulé", color: "text-red-600" },
};

export default function BookingsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const {
    data: guide,
    isLoading: isLoadingGuide,
    error: errorGuide,
  } = useGuideProfile(userId);

  const {
    data: bookings,
    isLoading: isLoadingBookings,
    error: errorBookings,
  } = useGuideBookings(guide?.id);

  const isLoading = isLoadingGuide || isLoadingBookings;
  const error = errorGuide || errorBookings;

  const apiBase = process.env.NEXT_PUBLIC_API_BASE?.replace("/api/", "") || "";

  const formatDate = (dateString: string | Date) => {
    return dayjs(dateString).format("D MMMM YYYY");
  };

  return (
    <div>
      {/* Header */}
      <div className="my-12">
        <h1 className="text-3xl font-extrabold text-dark !text-left mb-1">
          Bienvenu {session?.user?.first_name} {session?.user?.last_name}
        </h1>
        <p className="text-lg text-dark/80 font-normal">
          Gérer vos réservations
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <p className="text-dark/60">Chargement des réservations...</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-600">
          Erreur lors du chargement des réservations.
        </p>
      )}

      {/* Empty state */}
      {!isLoading && !error && bookings && bookings.length === 0 && (
        <p className="text-dark/60">Aucune réservation reçue pour le moment.</p>
      )}

      {/* Bookings list */}
      {!isLoading && !error && bookings && bookings.length > 0 && (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => {
            const experience = booking.experience;
            const client = booking.user;
            const city = experience?.city;
            const status =
              BookingStatusLabel[booking.status] || BookingStatusLabel.pending;

            // Get first media image
            const imageUrl = experience?.medias?.[0]?.url;

            return (
              <div
                key={booking.id}
                className="flex items-center rounded-2xl p-4 gap-5 shadow-sm hover:shadow-md transition"
              >
                {/* Experience image */}
                <div className="w-[130px] h-[100px] rounded-xl overflow-hidden shrink-0 bg-gray-light/30">
                  {imageUrl ? (
                    <img
                      src={`${apiBase}${imageUrl}`}
                      alt={experience?.title || "Expérience"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray text-xs">
                      Pas d&apos;image
                    </div>
                  )}
                </div>

                {/* Booking info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-primary font-semibold text-lg truncate leading-tight mb-1 w-fit">
                    {experience?.title || "Expérience inconnue"}
                  </h3>
                  <p className="text-sm text-dark/80 font-normal">
                    {formatDate(booking.booking_date)}
                    {city && (
                      <span className="text-dark/80 ml-3 font-normal">
                        {city.name}
                      </span>
                    )}
                  </p>
                  {client && (
                    <p className="text-sm text-dark/60 font-normal mt-0.5">
                      Avec{" "}
                      <span className="text-accent font-semibold text-sm">
                        {client.first_name} {client.last_name}
                      </span>
                    </p>
                  )}
                </div>

                {/* Status + Price */}
                <div className="text-right shrink-0 min-w-[140px]">
                  <p className="text-xs text-dark/50 font-normal">Statut</p>
                  <p className={`text-sm font-semibold ${status.color}`}>
                    {status.label}
                  </p>
                  <p className="text-xs text-dark/50 font-normal mt-2">Prix</p>
                  <p className="text-lg font-bold text-accent">
                    {booking.total_price} €
                  </p>
                </div>

                {/* Three dots menu */}
                <button className="p-2 rounded-lg bg-transparent hover:bg-gray-light/30 transition cursor-pointer">
                  <BsThreeDotsVertical size={18} className="text-dark/50" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
