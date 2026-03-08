"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import { useRequestProCard } from "@/services/guides/requestProCard";
import { useUpdateGuide } from "@/services/guides/updateGuide";
import { uploadGuideDocument } from "@/services/guides/uploadGuideDocument";
import { ApiError } from "@/services/instance";
import type { Guide } from "@/schemas/guide";
import { Upload, X, FileText } from "lucide-react";

interface RequestProModalProps {
  open: boolean;
  onClose: () => void;
  guide: Guide;
  userId: string;
}

interface DocumentFile {
  type: string;
  label: string;
  file: File | null;
}

export default function RequestProModal({
  open,
  onClose,
  guide,
  userId,
}: RequestProModalProps) {
  const [bio, setBio] = useState(guide.bio || "");
  const [languages, setLanguages] = useState(guide.languages || "");
  const [country, setCountry] = useState(guide.country || "");
  const [yearsOfExperience, setYearsOfExperience] = useState(
    guide.years_of_experience ?? 0,
  );

  const [documents, setDocuments] = useState<DocumentFile[]>([
    { type: "CV", label: "CV / Curriculum Vitae", file: null },
    { type: "diploma", label: "Diplôme", file: null },
    {
      type: "proof_of_residence",
      label: "Justificatif de domicile",
      file: null,
    },
  ]);

  const updateGuideMutation = useUpdateGuide(guide.id, userId);
  const requestProMutation = useRequestProCard(userId);

  const [isUploading, setIsUploading] = useState(false);

  const isSubmitting =
    updateGuideMutation.isPending ||
    requestProMutation.isPending ||
    isUploading;

  const hasAtLeastOneDoc = documents.some((d) => d.file !== null);

  const isFormValid =
    bio.trim().length >= 50 &&
    languages.trim().length > 0 &&
    country.trim().length > 0 &&
    yearsOfExperience >= 0;

  const handleFileChange = (index: number, file: File | null) => {
    setDocuments((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, file } : doc)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Veuillez remplir tous les champs correctement.");
      return;
    }

    try {
      setIsUploading(true);

      // 1. Mettre à jour le profil guide
      await updateGuideMutation.mutateAsync({
        bio,
        languages,
        country,
        years_of_experience: yearsOfExperience,
      });

      // 2. Uploader les fichiers vers MinIO
      const uploadedDocuments: {
        document_type: string;
        document_url: string;
      }[] = [];

      for (const doc of documents) {
        if (doc.file) {
          const url = await uploadGuideDocument(guide.id, doc.file);
          uploadedDocuments.push({
            document_type: doc.type,
            document_url: url,
          });
        }
      }

      // 3. Soumettre la demande pro avec les URLs des documents
      await requestProMutation.mutateAsync({
        guideId: guide.id,
        documents: uploadedDocuments,
      });

      toast.success(
        "Votre demande de passage en guide pro a été envoyée avec succès !",
      );
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 409) {
          toast.error(
            "Une demande de passage en guide pro est déjà en attente de validation.",
          );
        } else if (error.statusCode === 400) {
          toast.error("Vous êtes déjà un guide professionnel.");
        } else {
          toast.error(error.message || "Une erreur est survenue.");
        }
      } else {
        toast.error(
          "Une erreur est survenue lors de l'envoi de votre demande.",
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Demande de passage en guide pro"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-dark/80 mb-2">
          Complétez vos informations et fournissez vos documents justificatifs
          pour soumettre votre demande de passage en compte professionnel.
        </p>

        {/* Pays */}
        <div>
          <label
            htmlFor="pro-country"
            className="block text-sm font-bold text-dark mb-2"
          >
            Pays <span className="text-red-500">*</span>
          </label>
          <input
            id="pro-country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={isSubmitting}
            placeholder="Ex: France"
            className="w-full border-2 border-gray-light bg-gray-light/30 rounded-lg text-base px-4 py-3 focus:outline-none focus:border-accent text-dark placeholder:text-dark/40 transition-colors"
          />
        </div>

        {/* Langues */}
        <div>
          <label
            htmlFor="pro-languages"
            className="block text-sm font-bold text-dark mb-2"
          >
            Langues parlées <span className="text-red-500">*</span>
          </label>
          <input
            id="pro-languages"
            type="text"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            disabled={isSubmitting}
            placeholder="Ex: Français, Anglais, Espagnol"
            className="w-full border-2 border-gray-light bg-gray-light/30 rounded-lg text-base px-4 py-3 focus:outline-none focus:border-accent text-dark placeholder:text-dark/40 transition-colors"
          />
        </div>

        {/* Années d'expérience */}
        <div>
          <label
            htmlFor="pro-experience"
            className="block text-sm font-bold text-dark mb-2"
          >
            Années d&apos;expérience <span className="text-red-500">*</span>
          </label>
          <input
            id="pro-experience"
            type="number"
            min={0}
            max={99}
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(Number(e.target.value))}
            disabled={isSubmitting}
            className="w-full border-2 border-gray-light bg-gray-light/30 rounded-lg text-base px-4 py-3 focus:outline-none focus:border-accent text-dark placeholder:text-dark/40 transition-colors"
          />
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="pro-bio"
            className="block text-sm font-bold text-dark mb-2"
          >
            Biographie <span className="text-red-500">*</span>
            <span className="text-dark/40 font-normal ml-2">
              (min. 50 caractères)
            </span>
          </label>
          <textarea
            id="pro-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={isSubmitting}
            placeholder="Décrivez votre expérience et ce qui fait de vous un guide unique..."
            className="w-full border-2 border-gray-light bg-gray-light/30 rounded-lg text-base px-4 py-3 min-h-[120px] focus:outline-none focus:border-accent text-dark placeholder:text-dark/40 resize-none transition-colors"
          />
          <p className="text-xs text-dark/40 mt-1">
            {bio.length}/50 caractères minimum
          </p>
        </div>

        {/* Documents */}
        <div>
          <label className="block text-sm font-bold text-dark mb-3">
            Documents justificatifs
            <span className="text-dark/40 font-normal ml-2">
              (optionnel mais recommandé)
            </span>
          </label>
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div
                key={doc.type}
                className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-light bg-gray-light/10 hover:border-accent/50 transition-colors"
              >
                <FileText size={20} className="text-dark/40 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark">{doc.label}</p>
                  {doc.file ? (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-accent truncate">
                        {doc.file.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleFileChange(index, null)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-dark/30 mt-1">PDF, JPG ou PNG</p>
                  )}
                </div>
                <label className="cursor-pointer flex-shrink-0">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={isSubmitting}
                    onChange={(e) =>
                      handleFileChange(index, e.target.files?.[0] || null)
                    }
                  />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors">
                    <Upload size={14} />
                    {doc.file ? "Remplacer" : "Choisir"}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 text-base rounded-full font-bold text-dark bg-gray-200 hover:bg-gray-300 transition cursor-pointer duration-300"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="px-6 py-3 text-base rounded-full font-bold bg-accent text-white hover:bg-accent/90 transition flex items-center duration-300 gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Envoi en cours..." : "Soumettre ma demande"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
