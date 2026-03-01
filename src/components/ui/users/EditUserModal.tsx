"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import type { UserApiResponse } from "@/schemas/user";
import type { UpdateUser } from "@/schemas/user";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: UserApiResponse;
  onSave: (data: UpdateUser) => Promise<void>;
  loading?: boolean;
}

export default function EditUserModal({
  open,
  onClose,
  user,
  onSave,
  loading = false,
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData({ first_name: user.first_name, last_name: user.last_name });
      setErrors({});
    }
  }, [open, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!formData.first_name.trim())
      newErrors.first_name = "Le prénom est requis.";
    if (!formData.last_name.trim()) newErrors.last_name = "Le nom est requis.";
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
      toast.success("Informations mises à jour avec succès.");
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
    <Modal open={open} onClose={handleClose} title="Modifier mes informations">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Prénom */}
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-semibold text-dark mb-2"
          >
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={inputClass("first_name")}
            placeholder="Jean"
          />
          {errors.first_name && (
            <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>
          )}
        </div>

        {/* Nom */}
        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-semibold text-dark mb-2"
          >
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={inputClass("last_name")}
            placeholder="Dupont"
          />
          {errors.last_name && (
            <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>
          )}
        </div>

        {/* Email (lecture seule) */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Email
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="block w-full rounded-lg border-2 border-gray-200 py-2.5 px-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-400">
            L&apos;email ne peut pas être modifié ici.
          </p>
        </div>

        {/* Téléphone (lecture seule) */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            value={user.phone ?? "Non renseigné"}
            disabled
            className="block w-full rounded-lg border-2 border-gray-200 py-2.5 px-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-400">
            Le téléphone ne peut pas être modifié ici.
          </p>
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
