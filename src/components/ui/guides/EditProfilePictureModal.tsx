"use client";

import React, { useState, useRef } from "react";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { uploadGuideProfilePicture } from "@/services/guides/uploadGuideProfilePicture";
import { useQueryClient } from "@tanstack/react-query";

interface EditProfilePictureModalProps {
  open: boolean;
  onClose: () => void;
  guideId: string;
  userId: string;
  currentImageUrl: string;
  previousMediaId?: string | null;
}

export default function EditProfilePictureModal({
  open,
  onClose,
  guideId,
  userId,
  currentImageUrl,
  previousMediaId,
}: EditProfilePictureModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const fakeEvent = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(fakeEvent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Veuillez sélectionner une image.");
      return;
    }

    setLoading(true);
    try {
      await uploadGuideProfilePicture(guideId, selectedFile, previousMediaId);
      queryClient.invalidateQueries({ queryKey: ["guide-by-user", userId] });
      toast.success("Photo de profil mise à jour avec succès.");
      handleClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Une erreur est survenue.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setSelectedFile(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Modifier ma photo de profil"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drop zone */}
        <div
          className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all duration-200"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {preview ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-accent/20 shadow-md">
                <Image
                  src={preview}
                  alt="Aperçu"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-dark/60">{selectedFile?.name}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  setSelectedFile(null);
                }}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium bg-transparent border-none cursor-pointer"
              >
                <X size={12} /> Supprimer
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 mb-1">
                <Image
                  src={currentImageUrl}
                  alt="Photo actuelle"
                  fill
                  className="object-cover"
                />
              </div>
              <Upload size={20} className="text-accent" />
              <p className="text-sm font-medium text-dark">
                Glissez une image ici ou{" "}
                <span className="text-accent underline">
                  cliquez pour parcourir
                </span>
              </p>
              <p className="text-xs text-dark/40">JPG, PNG, WEBP — max 5 Mo</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3">
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
            disabled={loading || !selectedFile}
            className="flex-1 px-4 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors duration-200 shadow-md shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Envoi...
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
