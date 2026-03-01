"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import type { Guide } from "@/schemas/guide";
import type { UpdateGuide } from "@/schemas/guide";

interface EditGuideModalProps {
  open: boolean;
  onClose: () => void;
  guide: Guide;
  onSave: (data: UpdateGuide) => Promise<void>;
  loading?: boolean;
}

export default function EditGuideModal({
  open,
  onClose,
  guide,
  onSave,
  loading = false,
}: EditGuideModalProps) {
  const [formData, setFormData] = useState({
    country: guide.country ?? "",
    languages: guide.languages ?? "",
    years_of_experience: guide.years_of_experience ?? 0,
    bio: guide.bio ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        country: guide.country ?? "",
        languages: guide.languages ?? "",
        years_of_experience: guide.years_of_experience ?? 0,
        bio: guide.bio ?? "",
      });
      setErrors({});
    }
  }, [open, guide]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "years_of_experience" ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (
      formData.bio &&
      formData.bio.trim().length > 0 &&
      formData.bio.trim().length < 50
    ) {
      newErrors.bio = "La biographie doit contenir au moins 50 caractères.";
    }
    if (formData.years_of_experience < 0 || formData.years_of_experience > 99) {
      newErrors.years_of_experience =
        "Veuillez entrer une valeur entre 0 et 99.";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave(formData);
      toast.success("Profil guide mis à jour avec succès.");
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Une erreur est survenue.",
      );
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const inputClass = (field: string) =>
    `block w-full rounded-lg border-2 ${
      errors[field] ? "border-red-500" : "border-gray-200"
    } py-2.5 px-3 text-gray-900 placeholder:text-gray-400 focus:border-accent focus:ring-2 focus:ring-accent/20 text-sm transition-all`;

  return (
    <Modal open={open} onClose={handleClose} title="Modifier mon profil guide">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pays */}
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-semibold text-dark mb-2"
          >
            Pays
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={inputClass("country")}
            placeholder="Ex : France"
          />
          {errors.country && (
            <p className="mt-1 text-xs text-red-500">{errors.country}</p>
          )}
        </div>

        {/* Langues */}
        <div>
          <label
            htmlFor="languages"
            className="block text-sm font-semibold text-dark mb-2"
          >
            Langues
          </label>
          <input
            type="text"
            id="languages"
            name="languages"
            value={formData.languages}
            onChange={handleChange}
            className={inputClass("languages")}
            placeholder="Ex : Français, Anglais, Espagnol"
          />
          {errors.languages && (
            <p className="mt-1 text-xs text-red-500">{errors.languages}</p>
          )}
        </div>

        {/* Années d'expérience */}
        <div>
          <label
            htmlFor="years_of_experience"
            className="block text-sm font-semibold text-dark mb-2"
          >
            Années d&apos;expérience
          </label>
          <input
            type="number"
            id="years_of_experience"
            name="years_of_experience"
            min={0}
            max={99}
            value={formData.years_of_experience}
            onChange={handleChange}
            className={inputClass("years_of_experience")}
          />
          {errors.years_of_experience && (
            <p className="mt-1 text-xs text-red-500">
              {errors.years_of_experience}
            </p>
          )}
        </div>

        {/* Biographie */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-semibold text-dark mb-2"
          >
            Biographie
            <span className="text-gray-400 font-normal ml-1">
              (min. 50 caractères)
            </span>
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={5}
            value={formData.bio}
            onChange={handleChange}
            className={`${inputClass("bio")} resize-none`}
            placeholder="Décrivez votre parcours, votre passion pour les voyages..."
          />
          {errors.bio && (
            <p className="mt-1 text-xs text-red-500">{errors.bio}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent to-accent/80 text-white font-semibold rounded-lg hover:from-accent/90 hover:to-accent/70 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Enregistrement...
              </span>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
