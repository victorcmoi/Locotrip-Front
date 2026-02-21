"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocalizedPath } from "@/providers/i18n.provider";
import { useCreateExperience } from "@/services/experiences/createExperiences";
import { uploadExperiencePhotos } from "@/services/experiences/uploadExperiencePhotos";
import {
  createExperienceAvailability,
  type CreateAvailabilityData,
} from "@/services/experiences/createExperienceAvailability";
import { addCategoryToExperience } from "@/services/experiences/createExperienceCategory";
import ExperienceForm, {
  type ExperienceFormPayload,
} from "@/components/experiences/ExperienceForm";

export default function CreateExperiencePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const localizedPath = useLocalizedPath();
  const guideId = session?.user?.guide_id;
  const isGuide = session?.user?.role === "guide";

  const createExperience = useCreateExperience();

  if (!isGuide) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-dark/60 text-lg">
          Cette page est réservée aux guides.
        </p>
      </div>
    );
  }

  const handleSubmit = async (payload: ExperienceFormPayload) => {
    if (!guideId) throw new Error("Vous devez être connecté en tant que guide");

    const {
      formData,
      selectedCategories,
      newFiles,
      captions,
      newAvailabilitySlots,
    } = payload;

    const data = {
      title: formData.title,
      description: formData.description,
      price: formData.price as number,
      duration: formData.duration as number,
      city_id: formData.city_id,
      guide_id: guideId,
      ...(formData.max_capacity !== "" && {
        max_capacity: formData.max_capacity,
      }),
      ...(formData.meeting_point && {
        meeting_point: formData.meeting_point,
      }),
      ...(formData.meeting_latitude !== "" && {
        meeting_latitude: formData.meeting_latitude,
      }),
      ...(formData.meeting_longitude !== "" && {
        meeting_longitude: formData.meeting_longitude,
      }),
    };

    // 1. Create base experience
    const newExperience = await createExperience.mutateAsync(data);
    const id = newExperience.id;

    // 2. Add categories
    for (const categoryId of selectedCategories) {
      await addCategoryToExperience(id, categoryId);
    }

    // 3. Upload photos
    if (newFiles.length > 0) {
      await uploadExperiencePhotos(id, newFiles, captions);
    }

    // 4. Create availabilities
    for (const slot of newAvailabilitySlots) {
      const availData: CreateAvailabilityData = {
        experience_id: id,
        start_date: new Date(slot.start_date).toISOString(),
        end_date: new Date(slot.end_date).toISOString(),
        status: slot.status,
      };
      await createExperienceAvailability(availData);
    }

    // Redirect to success
    router.push(localizedPath(`/me/experiences/${id}`));
  };

  return (
    <ExperienceForm
      mode="create"
      onSubmit={handleSubmit}
      title="Créer une expérience"
      backHref={localizedPath("/me/experiences")}
      backLabel="Retour aux expériences"
      submitLabel="Créer l'expérience"
      submittingLabel="Création en cours..."
    />
  );
}
