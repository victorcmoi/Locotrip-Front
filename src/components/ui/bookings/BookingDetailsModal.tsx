"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import {
  EyeIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import Link from "next/link";
import BookingStatusBadge from "./BookingStatusBadge";
import GuidesRoutes from "@/utils/routes/guides.routes";

dayjs.locale("fr");

interface BookingDetailsModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  booking: any;
  experience?: {
    id: string;
    title: string;
    city?: {
      name: string;
      country?: string;
    };
    price?: number;
    duration?: number;
  };
  showGuide?: boolean;
  showBoth?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export default function BookingDetailsModal({
  booking,
  experience,
  showGuide = false,
  showBoth = false,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  trigger,
}: BookingDetailsModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const openModal = () => {
    if (!isControlled) setInternalIsOpen(true);
  };

  const closeModal = () => {
    if (externalOnClose) externalOnClose();
    if (!isControlled) setInternalIsOpen(false);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Non renseigné";
    return dayjs(dateString).format("D MMMM YYYY à HH:mm");
  };

  const formatShortDate = (dateString?: string | null) => {
    if (!dateString) return "Non renseigné";
    return dayjs(dateString).format("D MMMM YYYY");
  };

  // Get experience from booking or from props
  const exp = booking.experience || experience;
  const guide = booking.experience?.guide || exp?.guide;
  const guideUser = guide?.user;
  const client = booking.user;

  return (
    <>
      {trigger ? (
        <div onClick={openModal} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          onClick={openModal}
          className="inline-flex items-center p-2 rounded-lg bg-gray-light/50 text-dark/70 hover:bg-gray-light transition-colors cursor-pointer aspect-square"
          title="Voir les détails"
        >
          <EyeIcon className="h-5 w-5" />
        </button>
      )}

      <Modal
        open={isOpen}
        onClose={closeModal}
        title="Détails de la réservation"
      >
        <div className="space-y-6">
          {/* Statut et dates */}
          <section>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-dark/50 block pb-1">Statut</span>
                <BookingStatusBadge
                  bookingId={booking.id}
                  currentStatus={booking.status || "pending"}
                />
              </div>
              <div>
                <span className="text-xs text-dark/50 block">
                  Date de création
                </span>
                <span className="text-sm font-medium text-dark mt-1 block">
                  {formatDate(booking.created_at)}
                </span>
              </div>
              <div>
                <span className="text-xs text-dark/50 block">
                  Date de l&apos;expérience
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <CalendarIcon className="h-4 w-4 text-dark/40" />
                  <span className="text-sm font-medium text-dark">
                    {formatShortDate(booking.booking_date)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs text-dark/50 block">
                  ID de la réservation
                </span>
                <span className="text-xs font-mono text-dark/60 mt-1 block break-all">
                  {booking.id}
                </span>
              </div>
            </div>
          </section>

          {/* Détails financiers */}
          <section>
            <p className="text-sm font-bold text-dark uppercase tracking-wider mb-3">
              Détails financiers
            </p>
            <div className="grid grid-cols-3 gap-4 bg-gray-light/30 p-4 rounded-xl border border-gray-light">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-dark/50 mb-1">
                  <span className="text-xs text-center font-bold">€</span>
                  <span className="text-xs">Prix unitaire</span>
                </div>
                <span className="text-lg font-bold text-dark w-full inline-block text-center">
                  {exp?.price || "-"} €
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-dark/50 mb-1">
                  <UsersIcon className="h-4 w-4" />
                  <span className="text-xs">Participants</span>
                </div>
                <span className="text-lg font-bold text-dark w-full inline-block text-center">
                  x {booking.number_of_participants || 1}
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-dark/50 mb-1">
                  <span className="text-xs text-center font-bold">€</span>
                  <span className="text-xs">Total</span>
                </div>
                <span className="text-lg font-bold text-accent w-full inline-block text-center">
                  {booking.total_price || "-"} €
                </span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            {/* Client */}
            {client && (!showGuide || showBoth) && (
              <div className="block bg-gray-light/30 border border-gray-light rounded-xl p-4">
                <p className="text-sm font-bold text-dark uppercase tracking-wider mb-3 flex items-center">
                  <UserIcon className="h-4 w-4 inline mr-1" />
                  Client
                </p>
                <div>
                  <p className="text-sm font-semibold text-dark">
                    {client.first_name} {client.last_name}
                  </p>
                  <p className="text-xs text-dark/60">{client.email}</p>
                  {client.phone && (
                    <p className="text-xs text-dark/60 mt-1">{client.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Guide */}
            {guideUser && (showGuide || showBoth) && (
              <Link
                href={guide?.id ? GuidesRoutes.PROFILE(guide.id) : "#"}
                className="block bg-gray-light/30 border border-gray-light rounded-xl p-4 transition-colors hover:bg-gray-light/60"
              >
                <p className="text-sm font-bold text-dark uppercase tracking-wider mb-3 flex items-center">
                  <UserIcon className="h-4 w-4 inline mr-1" />
                  Guide
                </p>
                <div>
                  <p className="text-sm font-semibold text-dark">
                    {guideUser.first_name} {guideUser.last_name}
                  </p>
                  <p className="text-xs text-dark/60">{guideUser.email}</p>
                  {guideUser.phone && (
                    <p className="text-xs text-dark/60 mt-1">
                      {guideUser.phone}
                    </p>
                  )}
                  {guide?.id && (
                    <p className="text-xs text-accent mt-2 font-medium">
                      Voir le profil du guide
                    </p>
                  )}
                </div>
              </Link>
            )}

            {/* Expérience */}
            {exp && (
              <Link
                href={`/me/experiences/${exp.id}`}
                className="block cursor-pointer bg-gray-light/30 hover:bg-gray-light/60 transition-colors border border-gray-light rounded-xl p-4"
              >
                <p className="text-sm font-bold text-dark uppercase tracking-wider mb-3 flex items-center">
                  <MapPinIcon className="h-4 w-4 inline mr-1" />
                  Expérience
                </p>
                <div>
                  <p className="text-sm font-semibold text-dark">{exp.title}</p>
                  {exp.city && (
                    <p className="text-xs text-dark/60">
                      {exp.city.name}
                      {exp.city.country ? `, ${exp.city.country}` : ""}
                    </p>
                  )}
                  {exp.duration && (
                    <p className="text-xs text-dark/60 mt-1">
                      Durée : {exp.duration} min
                    </p>
                  )}
                </div>
              </Link>
            )}
          </section>

          {/* Notes spéciales */}
          {booking.special_requests && (
            <section>
              <h3 className="text-sm font-bold text-dark uppercase tracking-wider mb-3">
                Demandes spéciales
              </h3>
              <p className="text-sm text-dark whitespace-pre-wrap bg-gray-light/30 border border-gray-light p-4 rounded-xl">
                {booking.special_requests}
              </p>
            </section>
          )}
        </div>
      </Modal>
    </>
  );
}
