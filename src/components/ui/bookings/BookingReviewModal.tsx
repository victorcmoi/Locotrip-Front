"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { StarIcon } from "lucide-react";
import { useCreateReview } from "@/services/reviews/createReview";
import { useTranslations } from "@/providers/i18n.provider";

interface BookingReviewModalProps {
  experienceId: string;
  experienceTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BookingReviewModal({
  experienceId,
  experienceTitle,
  isOpen,
  onClose,
  onSuccess,
}: BookingReviewModalProps) {
  const dict = useTranslations();
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  
  const { mutate: createReview, isPending } = useCreateReview();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Veuillez donner une note de 1 à 5 étoiles.");
      return;
    }

    if (!session?.user?.id) {
      toast.error(dict.bookings.requireLogin);
      return;
    }

    createReview(
      {
        user_id: session.user.id,
        experience_id: experienceId,
        rating,
        title,
        comment,
      },
      {
        onSuccess: () => {
          toast.success("Votre avis a été publié avec succès !");
          setRating(0);
          setTitle("");
          setComment("");
          if (onSuccess) onSuccess();
          onClose();
        },
        onError: (error: any) => {
          // Si le backend renvoie un message spécifique (déjà un avis, etc.)
          const errorMsg = error?.response?.data?.message || "Erreur lors de l'envoi de votre avis.";
          toast.error(errorMsg);
        },
      }
    );
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Laisser un avis">
      <form onSubmit={handleSubmit} className="space-y-4">
        {experienceTitle && (
          <p className="text-sm font-medium text-dark/80 mb-2">
            Concernant : <span className="text-dark font-bold">{experienceTitle}</span>
          </p>
        )}
        
        <p className="text-sm text-dark/80 mb-4">
          Votre avis aidera d'autres voyageurs à choisir leur prochaine aventure.
        </p>

        <div className="flex flex-col items-center justify-center my-6">
          <label className="block text-sm font-bold text-dark mb-3">
            Votre note
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="cursor-pointer transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <StarIcon
                  className={`h-10 w-10 ${
                    (hoveredRating || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  } transition-colors`}
                  strokeWidth={(hoveredRating || rating) >= star ? 1 : 2}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-bold text-dark mb-2"
          >
            Titre de votre avis
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            placeholder="Résumez votre expérience en quelques mots..."
            className="w-full border-2 border-gray-light bg-gray-light/30 rounded-lg text-base px-4 py-3 focus:outline-none focus:border-accent text-dark placeholder:text-dark/40 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-bold text-dark mb-2"
          >
            Votre commentaire
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isPending}
            placeholder="Racontez-nous ce qui vous a plu ou déplu..."
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
            disabled={isPending || rating === 0}
            className="px-6 py-3 text-base rounded-full font-bold bg-accent text-white hover:bg-accent/90 transition flex items-center duration-300 gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Envoi en cours..." : "Publier l'avis"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
