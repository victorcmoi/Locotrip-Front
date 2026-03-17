"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  useGuideBookings,
  useMyBookings,
} from "@/services/bookings/getBookings";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { RefreshCw, HelpCircle, PinIcon, StarIcon } from "lucide-react";
import DropdownMenu from "@/components/ui/DropdownMenu";
import Image from "next/image";
import { MinioHelpers } from "@/utils/minio";
import BookingDetailsModal from "@/components/ui/bookings/BookingDetailsModal";
import CreateDisputeModal from "@/components/ui/bookings/CreateDisputeModal";
import BookingReviewModal from "@/components/ui/bookings/BookingReviewModal";
import { useTranslations } from "@/providers/i18n.provider";

dayjs.locale("fr");

export default function BookingsPage() {
  const dict = useTranslations();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const guideId = session?.user?.guide_id;
  const isGuide = session?.user?.role === "guide";
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [reportingBookingId, setReportingBookingId] = useState<string | null>(
    null,
  );
  const [reviewingBooking, setReviewingBooking] = useState<{id: string, experienceId: string, experienceTitle: string} | null>(null);

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

  const bookingStatusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: dict.bookings.statusPendingResponse, color: "text-primary" },
    confirmed: { label: dict.bookings.statusConfirmed, color: "text-green-600" },
    completed: { label: dict.bookings.statusCompleted, color: "text-blue-600" },
    cancelled: { label: dict.bookings.statusCancelled, color: "text-red-600" },
  };

  const statusFilters = [
    { value: "all", label: dict.bookings.filterAll },
    { value: "pending", label: dict.bookings.filterPending },
    { value: "confirmed", label: dict.bookings.filterConfirmed },
    { value: "completed", label: dict.bookings.filterCompleted },
    { value: "cancelled", label: dict.bookings.filterCancelled },
  ];

  return (
    <div>
      {/* Header */}
      <div className="my-12">
        <h1 className="text-3xl font-extrabold text-dark text-left! mb-1">
          {dict.bookings.welcome} {session?.user?.first_name} {session?.user?.last_name}
        </h1>
        <p className="text-lg text-dark/80 font-normal">
          {isGuide ? dict.bookings.manageReceivedBookings : dict.bookings.manageBookings}
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
        <p className="text-dark/60">{dict.bookings.loadingBookings}</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-600">
          {dict.bookings.errorLoadingBookings}
        </p>
      )}

      {/* Empty state */}
      {!isLoading &&
        !error &&
        filteredBookings &&
        filteredBookings.length === 0 && (
          <p className="text-dark/60">{dict.bookings.noBookingsForFilter}</p>
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
                bookingStatusLabel[booking.status] ||
                bookingStatusLabel.pending;

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

              const duration = experience?.duration || 0;
              const meetingPoint = experience?.meeting_point;

              const startTime = dayjs(booking.booking_date);
              const endTime = startTime.add(duration, "minute");
              const timeSchedule = `${startTime.format("HH:mm")} - ${endTime.format("HH:mm")}`;

              // Determine which dropdown items to show
              const dropdownItems = [];
              
              dropdownItems.push({
                label: dict.bookings.updateStatus,
                icon: RefreshCw,
                onClick: () => setEditingBookingId(booking.id),
              });
              
              dropdownItems.push({
                label: dict.bookings.reportIssue,
                icon: HelpCircle,
                onClick: () => setReportingBookingId(booking.id),
              });

              // Add Leave Review button if booking is completed and user is not guide
              if (!isGuide && booking.status === "completed" && experience?.id) {
                dropdownItems.push({
                  label: "Laisser un avis",
                  icon: StarIcon,
                  onClick: () => setReviewingBooking({
                    id: booking.id,
                    experienceId: experience.id,
                    experienceTitle: experience.title
                  }),
                });
              }

              return (
                <div
                  key={booking.id}
                  className="flex flex-col md:flex-row md:items-center rounded-2xl p-4 gap-4 md:gap-5 shadow-sm hover:shadow-md transition"
                >
                  {/* Experience image */}
                  <div className="w-full md:w-32.5 h-44 md:h-25 rounded-xl overflow-hidden shrink-0 bg-gray-light/30 relative">
                    {imageUrl ? (
                      <Image
                        src={MinioHelpers.experience(imageUrl)}
                        alt={experience?.title || dict.bookings.experienceAlt}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray text-xs">
                        {dict.bookings.noImage}
                      </div>
                    )}
                  </div>

                  {/* Booking info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-primary font-semibold text-xl! truncate leading-tight mb-1 w-fit">
                      {experience?.title || dict.bookings.unknownExperience}
                    </h3>
                    <div className="text-sm text-dark/80 font-normal flex flex-col sm:flex-row gap-1 sm:gap-3">
                      <p>
                        {formatDate(booking.booking_date)}
                        <span className="text-dark/80 ml-2 font-normal">
                          ({timeSchedule})
                        </span>
                      </p>
                      {city && (
                        <p className="text-dark/80 font-normal flex items-center">
                          <PinIcon className="h-4" />
                          {city.name}
                        </p>
                      )}
                    </div>
                    {meetingPoint && (
                      <p className="text-sm text-dark/70 font-normal mt-0.5">
                        {dict.bookings.meetingPointLabel}{" "}
                        <span className="font-medium text-dark/90">
                          {meetingPoint}
                        </span>
                      </p>
                    )}
                    {withName && (
                      <p className="text-sm text-dark/60 font-normal mt-0.5">
                        {dict.bookings.with}{" "}
                        <span className="text-accent font-semibold text-sm">
                          {withName}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Status + Price */}
                  <div className="text-left md:text-right shrink-0 md:min-w-35 w-full md:w-auto">
                    <p className="text-xs text-dark/50 font-normal">{dict.bookings.status}</p>
                    <p className={`text-sm font-semibold ${status.color}`}>
                      {status.label}
                    </p>
                    <p className="text-xs text-dark/50 font-normal mt-2">
                      {dict.bookings.price}
                    </p>
                    <p className="text-lg font-bold text-accent">
                      {booking.total_price} €
                    </p>
                  </div>

                  {/* Three dots menu */}
                  <DropdownMenu items={dropdownItems} />

                  {/* Booking Details (Admin Style) Modal */}
                  {editingBookingId === booking.id && (
                    <BookingDetailsModal
                      booking={booking}
                      showBoth={true}
                      trigger={null}
                      isOpen={true}
                      onClose={() => setEditingBookingId(null)}
                      canEdit={isGuide}
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
                  
                  {/* Booking Review Modal */}
                  {reviewingBooking?.id === booking.id && (
                    <BookingReviewModal
                      experienceId={reviewingBooking.experienceId}
                      experienceTitle={reviewingBooking.experienceTitle}
                      isOpen={true}
                      onClose={() => setReviewingBooking(null)}
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
