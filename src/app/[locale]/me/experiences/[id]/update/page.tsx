"use client";

import React, { use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocalizedPath } from "@/providers/i18n.provider";
import { useExperienceForGuide } from "@/services/experiences/getExperiences";
import { useUpdateExperience } from "@/services/experiences/updateExperiences";
import { uploadExperiencePhotos } from "@/services/experiences/uploadExperiencePhotos";
import {
  createExperienceAvailability,
  type CreateAvailabilityData,
} from "@/services/experiences/createExperienceAvailability";
import { addCategoryToExperience } from "@/services/experiences/createExperienceCategory";
import { updateExperienceSteps } from "@/services/experiences/updateExperienceSteps";
import { ApiRequest } from "@/services/instance";
import { z } from "zod";
import ExperienceForm, {
  type ExperienceFormPayload,
} from "@/components/ui/experiences/ExperienceForm";

export default function UpdateExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const localizedPath = useLocalizedPath();
  const guideId = session?.user?.guide_id;
  const isGuide = session?.user?.role === "guide";

  const updateExperience = useUpdateExperience();

  const {
    data: experience,
    isLoading,
    error,
  } = useExperienceForGuide(id, guideId || "");

  if (!isGuide) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-dark/60 text-lg">
          Cette page est réservée aux guides.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <p className="text-dark/60 py-12 text-center">
        Chargement de l&apos;expérience...
      </p>
    );
  }

  if (error || !experience) {
    return (
      <p className="text-red-600 py-12 text-center">
        Erreur lors du chargement de l&apos;expérience.
      </p>
    );
  }

  const handleSubmit = async (payload: ExperienceFormPayload) => {
    if (!guideId) throw new Error("Vous devez être connecté en tant que guide");

    const {
      formData,
      selectedCategories,
      originalCategories,
      newFiles,
      captions,
      existingMediasToDelete,
      newAvailabilitySlots,
      steps,
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
      ...(formData.additional_info &&
        formData.additional_info !== "<p><br></p>"
        ? { additional_info: formData.additional_info }
        : { additional_info: undefined }),
      is_accessible: formData.is_accessible,
    };

    // 1. Update experience core fields
    await updateExperience.mutateAsync({ id, data });

    // 2. Sync categories — remove old, add new
    const categoriesToRemove = originalCategories.filter(
      (c) => !selectedCategories.includes(c),
    );
    const categoriesToAdd = selectedCategories.filter(
      (c) => !originalCategories.includes(c),
    );

    for (const categoryId of categoriesToRemove) {
      await new ApiRequest<unknown>(z.any()).delete(
        `experiences/${id}/categories/${categoryId}`,
      );
    }
    for (const categoryId of categoriesToAdd) {
      await addCategoryToExperience(id, categoryId);
    }

    // 3. Delete marked existing photos
    for (const mediaId of existingMediasToDelete) {
      await new ApiRequest<unknown>(z.any()).delete(`media/${mediaId}`);
    }

    // 4. Upload new photos
    if (newFiles.length > 0) {
      await uploadExperiencePhotos(id, newFiles, captions);
    }

    // 5. Create new availability slots
    for (const slot of newAvailabilitySlots) {
      const availData: CreateAvailabilityData = {
        experience_id: id,
        start_date: new Date(slot.start_date).toISOString(),
        end_date: new Date(slot.end_date).toISOString(),
        status: slot.status,
      };
      await createExperienceAvailability(availData);
    }

    // 6. Replace steps
    const validSteps = steps.filter((s) => s.title.trim());
    await updateExperienceSteps(
      id,
      validSteps.map((s, i) => ({
        step_number: i + 1,
        title: s.title,
        ...(s.description && { description: s.description }),
      })),
    );

    router.push(localizedPath(`/me/experiences/${id}`));
  };

  return (
    <ExperienceForm
      mode="update"
      initialExperience={experience}
      onSubmit={handleSubmit}
      title="Modifier l'expérience"
      backHref={localizedPath(`/me/experiences/${id}`)}
      backLabel="Retour à l'expérience"
      submitLabel="Enregistrer les modifications"
      submittingLabel="Enregistrement en cours..."
    />
  );
}
