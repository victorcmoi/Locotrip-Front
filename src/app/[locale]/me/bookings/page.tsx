"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  useGuideBookings,
  useMyBookings,
} from "@/services/bookings/getBookings";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { RefreshCw, HelpCircle } from "lucide-react";
import DropdownMenu from "@/components/ui/DropdownMenu";
import Image from "next/image";
import { MinioHelpers } from "@/utils/minio";
import BookingDetailsModal from "@/components/ui/bookings/BookingDetailsModal";
import CreateDisputeModal from "@/components/ui/bookings/CreateDisputeModal";

dayjs.locale("fr");

const BookingStatusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: "En Attente de réponse", color: "text-primary" },
  confirmed: { label: "Confirmé", color: "text-green-600" },
  completed: { label: "Terminé", color: "text-blue-600" },
  cancelled: { label: "Annulé", color: "text-red-600" },
};

const statusFilters = [
  { value: "all", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmé" },
  { value: "completed", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
];

export default function BookingsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const guideId = session?.user?.guide_id;
  const isGuide = session?.user?.role === "guide";
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [reportingBookingId, setReportingBookingId] = useState<string | null>(null);

  const {
    data: guideBookings,
    isLoading: isLoadingGuideBookings,
    error: errorGuideBookings,
  } = useGuideBookings(isGuide ? guideId : undefined);

  const {
    data: userBookings,
    isLoading: isLoadingUserBookings,
    error: errorUserBookings,
  } = useMyBookings(!isGuide ? userId : undefined);

  const bookings = isGuide ? guideBookings : userBookings;
  const isLoading = isGuide ? isLoadingGuideBookings : isLoadingUserBookings;
  const error = isGuide ? errorGuideBookings : errorUserBookings;

  const filteredBookings = useMemo(
    () =>
      bookings?.filter(
        (b) => statusFilter === "all" || b.status === statusFilter,
      ),
    [bookings, statusFilter],
  );

  const formatDate = (dateString: string | Date) => {
    return dayjs(dateString).format("D MMMM YYYY");
  };

  return (
    <div>
      {/* Header */}
      <div className="my-12">
        <h1 className="text-3xl font-extrabold text-dark !text-left mb-1">
          Bienvenue {session?.user?.first_name} {session?.user?.last_name}
        </h1>
        <p className="text-lg text-dark/80 font-normal">
          {isGuide ? "Gérer vos réservations reçues" : "Gérer vos réservations"}
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition cursor-pointer border ${
              statusFilter === filter.value
                ? "bg-accent text-white border-accent"
                : "bg-transparent text-dark/70 border-dark/15 hover:border-accent hover:text-accent"
            }`}
          >
            {filter.label}
          </button>
        ))}
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
      {!isLoading &&
        !error &&
        filteredBookings &&
        filteredBookings.length === 0 && (
          <p className="text-dark/60">Aucune réservation pour ce filtre.</p>
        )}

      {/* Bookings list */}
      {!isLoading &&
        !error &&
        filteredBookings &&
        filteredBookings.length > 0 && (
          <div className="flex flex-col gap-4">
            {filteredBookings.map((booking) => {
              const experience = booking.experience;
              const client = booking.user;
              const city = experience?.city;
              const guideUser = experience?.guide?.user;
              const status =
                BookingStatusLabel[booking.status] ||
                BookingStatusLabel.pending;

              // Get first media image
              const imageUrl = experience?.medias?.[0]?.url;

              // "Avec" line: guide sees client name, client sees guide name
              const withName = isGuide
                ? client
                  ? `${client.first_name} ${client.last_name}`
                  : null
                : guideUser
                  ? `${guideUser.first_name} ${guideUser.last_name}`
                  : null;

              return (
                <div
                  key={booking.id}
                  className="flex items-center rounded-2xl p-4 gap-5 shadow-sm hover:shadow-md transition"
                >
                  {/* Experience image */}
                  <div className="w-[130px] h-[100px] rounded-xl overflow-hidden shrink-0 bg-gray-light/30 relative">
                    {imageUrl ? (
                      <Image
                        src={MinioHelpers.experience(imageUrl)}
                        alt={experience?.title || "Expérience"}
                        fill
                        className="object-cover"
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
                    {withName && (
                      <p className="text-sm text-dark/60 font-normal mt-0.5">
                        Avec{" "}
                        <span className="text-accent font-semibold text-sm">
                          {withName}
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
                    <p className="text-xs text-dark/50 font-normal mt-2">
                      Prix
                    </p>
                    <p className="text-lg font-bold text-accent">
                      {booking.total_price} €
                    </p>
                  </div>

                  {/* Three dots menu */}
                  <DropdownMenu
                    items={[
                      {
                        label: "Modifier le statut",
                        icon: RefreshCw,
                        onClick: () => setEditingBookingId(booking.id),
                      },
                      {
                        label: "Signaler un problème",
                        icon: HelpCircle,
                        onClick: () => setReportingBookingId(booking.id),
                      },
                    ]}
                  />

                  {/* Booking Details (Admin Style) Modal */}
                  {editingBookingId === booking.id && (
                    <BookingDetailsModal
                      booking={booking}
                      showBoth={true}
                      trigger={null}
                      isOpen={true}
                      onClose={() => setEditingBookingId(null)}
                    />
                  )}

                  {/* Create Dispute Modal */}
                  {reportingBookingId === booking.id && (
                    <CreateDisputeModal
                      bookingId={booking.id}
                      isOpen={true}
                      onClose={() => setReportingBookingId(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
