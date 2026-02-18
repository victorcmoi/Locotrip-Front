"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useExperiencesByGuide } from "@/services/experiences/getExperiences";
import { useGuideById } from "@/services/guides/getGuides";
import { MinioHelpers } from "@/utils/minio";
import { IoCheckmarkCircle } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { LuMapPin } from "react-icons/lu";
import { FiExternalLink, FiEdit, FiTrash2 } from "react-icons/fi";
import type { Experience } from "@/schemas/experience";
import Image from "next/image";
import { useLocalizedPath } from "@/providers/i18n.provider";
import DropdownMenu from "@/components/ui/DropdownMenu";

export default function ExperiencesPage() {
  const { data: session } = useSession();
  const guideId = session?.user?.guide_id;
  const isGuide = session?.user?.role === "guide";
  const localizedPath = useLocalizedPath();

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
          Cette page est réservée aux guides.
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
      <div className="my-12">
        <h1 className="text-3xl font-extrabold text-dark !text-left mb-1">
          Bienvenu {session?.user?.first_name} {session?.user?.last_name}
        </h1>
        <p className="text-lg text-dark/80 font-semibold">Gérer vos offres</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <p className="text-dark/60">Chargement des expériences...</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-600">
          Erreur lors du chargement des expériences.
        </p>
      )}

      {/* Empty state */}
      {!isLoading && !error && experiences && experiences.length === 0 && (
        <p className="text-dark/60">Vous n&apos;avez aucune expérience.</p>
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
                  {/* Three dots dropdown menu */}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu
                      items={[
                        {
                          label: "Ouvrir",
                          icon: FiExternalLink,
                          href: localizedPath(
                            `/me/experiences/${experience.id}`,
                          ),
                        },
                        {
                          label: "Modifier",
                          icon: FiEdit,
                        },
                        {
                          label: "Supprimer",
                          icon: FiTrash2,
                          variant: "danger",
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
                      Avec{" "}
                      <span className="font-bold">
                        {guide?.user?.first_name}{" "}
                        {guide?.user?.last_name?.toUpperCase()}
                      </span>
                    </p>
                    {guide?.pro_card && (
                      <IoCheckmarkCircle className="text-[#7BCECC] text-xl" />
                    )}
                  </div>

                  {/* Stars + reviews */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <AiFillStar
                          key={i}
                          className={`text-base ${
                            i < Math.round(avgRating)
                              ? "text-secondary"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-dark/60">
                      {reviewCount} avis
                    </span>
                  </div>

                  {/* Experience title */}
                  <h3 className="text-primary font-semibold text-lg mb-2 leading-tight">
                    {experience.title}
                  </h3>

                  {/* City */}
                  {city && (
                    <div className="flex items-center gap-1 mb-2">
                      <LuMapPin className="text-primary text-base" />
                      <span className="text-dark font-medium text-sm">
                        {city.name}
                      </span>
                    </div>
                  )}

                  {/* Languages */}
                  {guide?.languages && (
                    <p className="text-sm text-dark/70 mb-3">
                      Langue : {guide.languages}
                    </p>
                  )}

                  {/* Duration + Price */}
                  <div className="flex items-center gap-6 mb-4">
                    <span className="text-dark font-semibold text-lg">
                      {formatDuration(experience.duration)}
                    </span>
                    <span className="text-dark font-semibold text-lg">
                      {experience.price}€/Pers
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
                  <button className="bg-transparent mt-2 px-6 py-2 rounded-full border-2 border-accent text-accent font-semibold text-sm hover:bg-accent hover:text-white transition-colors duration-200 cursor-pointer">
                    Booster
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
