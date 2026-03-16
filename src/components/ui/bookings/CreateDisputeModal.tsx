"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import { useCreateDispute } from "@/services/disputes/createDispute";
import { useSession } from "next-auth/react";
import { useTranslations } from "@/providers/i18n.provider";

interface CreateDisputeModalProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateDisputeModal({
  bookingId,
  isOpen,
  onClose,
}: CreateDisputeModalProps) {
  const dict = useTranslations();
  const { data: session } = useSession();
  const [reason, setReason] = useState("");
  const { mutate: createDispute, isPending } = useCreateDispute();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error(dict.bookings.disputeReasonRequired);
      return;
    }

    if (!session?.user?.id) {
      toast.error(dict.bookings.mustBeLoggedInToReport);
      return;
    }

    createDispute(
      {
        bookingId,
        data: {
          booking_id: bookingId,
          user_id: session.user.id,
          reason,
          status: "open",
        },
      },
      {
        onSuccess: () => {
          toast.success(dict.bookings.disputeSentSuccess);
          setReason("");
          onClose();
        },
        onError: () => {
          toast.error(dict.bookings.disputeSentError);
        },
      },
    );
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={dict.bookings.reportIssue}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-dark/80 mb-4">
          {dict.bookings.reportIssueDescription}
        </p>

        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-bold text-dark mb-2"
          >
            {dict.bookings.reportReason}
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isPending}
            placeholder={dict.bookings.reportReasonPlaceholder}
            className="w-full border-2 border-gray-light bg-gray-light/30 rounded-lg text-base px-4 py-3 min-h-30 focus:outline-none focus:border-accent text-dark placeholder:text-dark/40 resize-none transition-colors"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-6 py-3 text-base rounded-full font-bold text-dark bg-gray-200 hover:bg-gray-300 transition cursor-pointer duration-300"
          >
            {dict.common.cancel}
          </button>
          <button
            type="submit"
            disabled={isPending || !reason.trim()}
            className="px-4 py-2 text-base rounded-full font-bold bg-accent text-white hover:bg-accent/90 transition flex items-center duration-300 gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? dict.bookings.sendingInProgress : dict.bookings.sendReport}
          </button>
        </div>
      </form>
    </Modal>
  );
}
