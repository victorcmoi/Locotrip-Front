"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useExperiencesByGuide } from "@/services/experiences/getExperiences";
import { useDeleteExperience } from "@/services/experiences/deleteExperiences";
import { useGuideById } from "@/services/guides/getGuides";
import { MinioHelpers } from "@/utils/minio";
import {
  CheckCircle,
  MapPin,
  ExternalLink,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsStarHalf } from "react-icons/bs";
import type { Experience } from "@/schemas/experience";
import Image from "next/image";
import { useLocalizedPath, useTranslations } from "@/providers/i18n.provider";
import DropdownMenu from "@/components/ui/DropdownMenu";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Link from "next/link";

export default function ExperiencesPage() {
  const dict = useTranslations();
  const { data: session } = useSession();
  const guideId = session?.user?.guide_id;
  const isGuide = session?.user?.role === "guide";
  const localizedPath = useLocalizedPath();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const deleteMutation = useDeleteExperience();

  const { data: guide } = useGuideById(guideId || "");
  const {
    data: experiences,
    isLoading,
    error,
  } = useExperiencesByGuide(guideId || "");

  if (!isGuide) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-dark/60 text-lg">
          {dict.experiences.guideOnlyPage}
        </p>
      </div>
    );
  }

  const guideProfilePicture = guide?.medias?.[0]?.url;

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="my-12 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-dark text-left! mb-1">
            {dict.bookings.welcome} {session?.user?.first_name} {session?.user?.last_name}
          </h1>
          <p className="text-lg text-dark/80 font-semibold">{dict.experiences.manageOffers}</p>
        </div>
        <Link
          href={localizedPath("/me/experiences/create")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors duration-200 shadow-md shadow-accent/20 cursor-pointer"
        >
          <Plus size={16} />
          {dict.experiences.createExperience}
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <p className="text-dark/60">{dict.experiences.loading}</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-600">
          {dict.experiences.error}
        </p>
      )}

      {/* Empty state */}
      {!isLoading && !error && experiences && experiences.length === 0 && (
        <p className="text-dark/60">{dict.experiences.noExperienceYet}</p>
      )}

      {/* Experience cards grid */}
      {!isLoading && !error && experiences && experiences.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
          {experiences.map((experience: Experience) => {
            const coverImage = experience.medias?.[0]?.url;
            const city = experience.city;
            const reviews = experience.reviews ?? [];
            const reviewCount = experience.reviewCount ?? reviews.length;
            const avgRating =
              experience.avgRating ??
              (reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0);

            return (
              <div
                key={experience.id}
                className="bg-light rounded-2xl shadow-md overflow-hidden flex flex-col border border-gray-light hover:shadow-lg transition-shadow duration-300"
              >
                {/* Cover image */}
                <div className="relative h-52 w-full">
                  <Image
                    src={MinioHelpers.experience(coverImage)}
                    alt={experience.title}
                    fill
                    className="object-cover"
                  />
                  {/* Status badge + Three dots dropdown menu */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
                        experience.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {experience.is_published ? dict.experiences.published : dict.experiences.draft}
                    </span>
                    <DropdownMenu
                      items={[
                        {
                          label: dict.experiences.open,
                          icon: ExternalLink,
                          href: localizedPath(
                            `/me/experiences/${experience.id}`,
                          ),
                        },
                        {
                          label: dict.common.edit,
                          icon: Pencil,
                          href: localizedPath(
                            `/me/experiences/${experience.id}/update`,
                          ),
                        },
                        {
                          label: dict.common.delete,
                          icon: Trash2,
                          variant: "danger",
                          onClick: () =>
                            setDeleteTarget({
                              id: experience.id,
                              title: experience.title,
                            }),
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* Guide avatar overlapping */}
                <div className="flex justify-center -mt-10 relative z-10">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-light shadow-md">
                    <Image
                      src={MinioHelpers.guideProfile(
                        guideId,
                        guideProfilePicture,
                      )}
                      alt={`${guide?.user?.first_name} ${guide?.user?.last_name}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                {/* Card content */}
                <div className="px-6 pb-6 pt-3 flex flex-col items-center text-center flex-1">
                  {/* Guide name + pro badge */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-sm text-dark">
                      {dict.bookings.with}{" "}
                      <span className="font-bold">
                        {guide?.user?.first_name}{" "}
                        {guide?.user?.last_name?.toUpperCase()}
                      </span>
                    </p>
                    {guide?.pro_card && (
                      <CheckCircle className="text-[#7BCECC] text-xl" />
                    )}
                  </div>

                  {/* Stars + reviews */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        avgRating >= i + 1 ? (
                          <AiFillStar key={i} className="text-secondary text-base" />
                        ) : avgRating >= i + 0.5 ? (
                          <BsStarHalf key={i} className="text-secondary text-base" />
                        ) : (
                          <AiOutlineStar key={i} className="text-gray-300 text-base" />
                        )
                      ))}
                    </div>
                    <span className="text-sm text-dark/60">
                      {reviewCount} {dict.guides.profile.reviews}
                    </span>
                  </div>

                  {/* Experience title */}
                  <h3 className="text-primary font-semibold text-lg mb-2 leading-tight">
                    {experience.title}
                  </h3>

                  {/* City */}
                  {city && (
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="text-primary" size={16} />
                      <span className="text-dark font-medium text-sm">
                        {city.name}
                      </span>
                    </div>
                  )}

                  {/* Languages */}
                  {guide?.languages && (
                    <p className="text-sm text-dark/70 mb-3">
                      {dict.common.languages} {guide.languages}
                    </p>
                  )}

                  {/* Duration + Price */}
                  <div className="flex items-center gap-6 mb-4">
                    <span className="text-dark font-semibold text-lg">
                      {formatDuration(experience.duration)}
                    </span>
                    <span className="text-dark font-semibold text-lg">
                      {experience.price}€/{dict.common.person}
                    </span>
                  </div>

                  {/* Description */}
                  {experience.description && (
                    <p className="text-sm text-dark/60 leading-relaxed mb-4 line-clamp-3">
                      {experience.description}
                    </p>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Booster button */}
                  <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-accent text-accent font-semibold text-sm hover:bg-accent hover:text-white transition-colors duration-200 cursor-pointer bg-transparent mt-2 w-full">
                    {dict.experiences.booster}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
        title={dict.experiences.deleteExperienceTitle}
        message={dict.experiences.deleteExperienceMessage.replace("{title}", deleteTarget?.title || "")}
        confirmLabel={dict.common.delete}
        cancelLabel={dict.common.cancel}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
