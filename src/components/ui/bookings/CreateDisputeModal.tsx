"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import { useCreateDispute } from "@/services/disputes/createDispute";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const [reason, setReason] = useState("");
  const { mutate: createDispute, isPending } = useCreateDispute();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error("Veuillez indiquer le motif de votre signalement.");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Vous devez être connecté pour signaler un problème.");
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
          toast.success(
            "Votre signalement a bien été envoyé. Notre équipe va l'étudier.",
          );
          setReason("");
          onClose();
        },
        onError: (error) => {
          console.error("Erreur lors de la création du litige:", error);
          toast.error(
            "Une erreur est survenue lors de l'envoi de votre signalement.",
          );
        },
      },
    );
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Signaler un problème">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-dark/80 mb-4">
          Vous rencontrez un problème avec cette réservation ? Expliquez-nous en
          détail la situation, notre équipe étudiera votre demande dans les plus
          brefs délais.
        </p>

        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-bold text-dark mb-2"
          >
            Motif de votre signalement
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isPending}
            placeholder="Ex: Le guide n'était pas au point de rendez-vous..."
            className="w-full border-2 border-gray-light bg-gray-light/30 rounded-lg text-base px-4 py-3 min-h-[120px] focus:outline-none focus:border-accent text-dark placeholder:text-dark/40 resize-none transition-colors"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-6 py-3 text-base rounded-full font-bold text-dark bg-gray-200 hover:bg-gray-300 transition cursor-pointer duration-300"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending || !reason.trim()}
            className="px-4 py-2 text-base rounded-full font-bold bg-accent text-white hover:bg-accent/90 transition flex items-center duration-300 gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Envoi en cours..." : "Envoyer le signalement"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
