"use client";

import React, { use, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useExperienceForGuide } from "@/services/experiences/getExperiences";
import { useDeleteExperience } from "@/services/experiences/deleteExperiences";
import {
  usePublishExperience,
  useUnpublishExperience,
} from "@/services/experiences/publishExperiences";
import { useGuideById } from "@/services/guides/getGuides";
import { MinioHelpers } from "@/utils/minio";
import {
  CheckCircle,
  Star,
  MapPin,
  Pencil,
  Trash2,
  Flag,
  Send,
  Calendar,
  ArrowLeft,
  Accessibility,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocalizedPath } from "@/providers/i18n.provider";
import DropdownMenu from "@/components/ui/DropdownMenu";
import ConfirmModal from "@/components/ui/ConfirmModal";
import dynamic from "next/dynamic";

const LocationDisplay = dynamic(
  () => import("@/components/ui/experiences/LocationDisplay"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] rounded-xl bg-gray-100 animate-pulse" />
    ),
  },
);

export default function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const guideId = session?.user?.guide_id;
  const isGuide = session?.user?.role === "guide";
  const localizedPath = useLocalizedPath();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const deleteMutation = useDeleteExperience();
  const publishMutation = usePublishExperience();
  const unpublishMutation = useUnpublishExperience();

  const {
    data: experience,
    isLoading,
    error,
  } = useExperienceForGuide(id, guideId || "");
  const { data: guide } = useGuideById(guideId || "");

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
      <p className="text-dark/60 py-12">Chargement de l&apos;expérience...</p>
    );
  }

  if (error || !experience) {
    return (
      <p className="text-red-600 py-12">
        Erreur lors du chargement de l&apos;expérience.
      </p>
    );
  }

  const coverImage = experience.medias?.[0]?.url;
  const guideProfilePicture = guide?.medias?.[0]?.url;
  const city = experience.city;
  const reviews = experience.reviews ?? [];
  const reviewCount = experience.reviewCount ?? reviews.length;
  const avgRating =
    experience.avgRating ??
    (reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0);
  const categories =
    experience.categories
      ?.map((c) => c.category?.name)
      .filter((n): n is string => !!n) ?? [];

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}`;
  };

  return (
    <div className="py-8">
      {/* Back link + action buttons */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={localizedPath("/me/experiences")}
          className="flex items-center gap-2 text-dark/70 hover:text-dark transition text-sm font-medium"
        >
          <ArrowLeft size={12} />
          Retour aux expériences
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPublishModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm transition-colors duration-200 cursor-pointer bg-transparent ${
              experience.is_published
                ? "border-yellow-400 text-yellow-600 hover:bg-yellow-500 hover:text-white"
                : "border-accent text-accent hover:bg-accent hover:text-white"
            }`}
          >
            <Send size={16} />
            {experience.is_published ? "Mettre en brouillon" : "Publier"}
          </button>
          <Link
            href={localizedPath(`/me/experiences/${id}/update`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-accent text-accent font-semibold text-sm hover:bg-accent hover:text-white transition-colors duration-200 cursor-pointer bg-transparent"
          >
            <Pencil size={16} />
            Modifier
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-400 text-red-500 font-semibold text-sm hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent"
          >
            <Trash2 size={16} />
            Supprimer
          </button>
        </div>
      </div>

      {/* Cover image */}
      <div className="relative w-full h-72 rounded-2xl overflow-hidden mb-8">
        <Image
          src={MinioHelpers.experience(coverImage)}
          alt={experience.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column — details */}
        <div className="lg:col-span-2">
          {/* Title */}
          <h1 className="text-3xl font-extrabold text-dark mb-2 !text-left">
            {experience.title}
          </h1>

          {/* City */}
          {city && (
            <div className="flex items-center gap-1.5 mb-4">
              <MapPin className="text-primary" size={18} />
              <span className="text-dark/80 font-medium">
                {city.name}, {city.country}
              </span>
            </div>
          )}

          {/* Stars */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={`${
                    i < Math.round(avgRating)
                      ? "text-secondary fill-secondary"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-dark/60 font-medium">
              {avgRating > 0 ? avgRating.toFixed(1) : "–"} · {reviewCount} avis
            </span>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-sm bg-light border border-gray-light text-dark"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {experience.description && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-dark mb-2">Description</h2>
              <p className="text-dark/70 leading-relaxed whitespace-pre-line">
                {experience.description}
              </p>
            </div>
          )}

          {/* Informations complémentaires */}
          {experience.additional_info &&
            experience.additional_info !== "<p><br></p>" && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-dark mb-2">
                  Informations complémentaires
                </h2>
                <div
                  className="text-dark/70 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: experience.additional_info,
                  }}
                />
              </div>
            )}

          {/* Étapes de l'expérience */}
          {experience.steps && experience.steps.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-dark mb-4">
                Déroulement ({experience.steps.length} étapes)
              </h2>
              <div className="flex flex-col gap-3">
                {experience.steps.map((step, i) => (
                  <div
                    key={step.id}
                    className="flex items-start gap-3 p-4 rounded-xl border border-gray-light bg-light"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white font-bold text-sm shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-dark font-semibold">{step.title}</p>
                      {step.description && (
                        <p className="text-dark/60 text-sm mt-1">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meeting point */}
          {(experience.meeting_point ||
            (experience.meeting_latitude != null &&
              experience.meeting_longitude != null)) && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-dark mb-2">
                Point de rencontre
              </h2>
              {experience.meeting_point && (
                <p className="text-dark/70 mb-3">{experience.meeting_point}</p>
              )}
              {experience.meeting_latitude != null &&
                experience.meeting_longitude != null && (
                  <>
                    <LocationDisplay
                      latitude={experience.meeting_latitude}
                      longitude={experience.meeting_longitude}
                    />
                    <p className="text-dark/50 text-xs mt-2 font-mono">
                      📍 {experience.meeting_latitude.toFixed(6)},{" "}
                      {experience.meeting_longitude.toFixed(6)}
                    </p>
                  </>
                )}
            </div>
          )}

          {/* Photos */}
          {experience.medias && experience.medias.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-dark mb-4">
                Photos ({experience.medias.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {experience.medias.map((media) => (
                  <div key={media.id} className="flex flex-col gap-1.5">
                    <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-gray-light group">
                      <Image
                        src={MinioHelpers.experience(media.url)}
                        alt={media.description || experience.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    {media.description && (
                      <p className="text-xs text-dark/60 px-1 line-clamp-2">
                        {media.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {experience.availabilities &&
            experience.availabilities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-dark mb-4">
                  Disponibilités ({experience.availabilities.length})
                </h2>
                <div className="flex flex-col gap-2">
                  {experience.availabilities.map((avail) => (
                    <div
                      key={avail.id}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-light bg-light text-sm"
                    >
                      <Calendar className="text-accent shrink-0" size={16} />
                      <span className="text-dark font-medium">
                        {new Date(avail.start_date).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                      <span className="text-dark/40">→</span>
                      <span className="text-dark font-medium">
                        {new Date(avail.end_date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          avail.status === "available"
                            ? "bg-green-100 text-green-700"
                            : avail.status === "blocked"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {avail.status === "available"
                          ? "Disponible"
                          : avail.status === "blocked"
                            ? "Bloqué"
                            : "Indisponible"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-dark mb-4">
                Avis ({reviewCount})
              </h2>
              <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-xl border border-gray-light relative"
                  >
                    <div className="absolute top-3 right-3">
                      <DropdownMenu
                        items={[
                          {
                            label: "Signaler",
                            icon: Flag,
                            variant: "danger",
                          },
                        ]}
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < review.rating
                                ? "text-secondary fill-secondary"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      {review.user && (
                        <span className="text-sm text-dark/60">
                          {review.user.first_name} {review.user.last_name}
                        </span>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-dark/70">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — info card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-md border border-gray-light p-6 sticky top-32 -mt-24">
            {/* Guide info */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-light shrink-0">
                <Image
                  src={MinioHelpers.guideProfile(guideId, guideProfilePicture)}
                  alt={`${guide?.user?.first_name} ${guide?.user?.last_name}`}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-dark">
                    {guide?.user?.first_name}{" "}
                    {guide?.user?.last_name?.toUpperCase()}
                  </p>
                  {guide?.pro_card && (
                    <CheckCircle className="text-[#7BCECC]" size={20} />
                  )}
                </div>
                {guide?.languages && (
                  <p className="text-sm text-dark/60">{guide.languages}</p>
                )}
              </div>
            </div>

            <hr className="border-gray-light mb-5" />

            {/* Key info */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark/60">Prix</span>
                <span className="text-lg font-bold text-accent">
                  {experience.price}€ / pers
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark/60">Durée</span>
                <span className="text-lg font-bold text-dark">
                  {formatDuration(experience.duration)}
                </span>
              </div>
              {experience.max_capacity && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-dark/60">Capacité max</span>
                  <span className="text-lg font-bold text-dark">
                    {experience.max_capacity} pers
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark/60 flex items-center gap-1.5">
                  Accessibilité
                </span>
                <span
                  className={`text-sm flex gap-1.5 font-semibold ${
                    experience.is_accessible ? "text-green-600" : "text-red-500"
                  }`}
                >
                  <Accessibility size={16} />{" "}
                  {experience.is_accessible ? "Oui" : "Non"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark/60">Statut</span>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    experience.is_published
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {experience.is_published ? "Publiée" : "Brouillon"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark/60">Active</span>
                <span
                  className={`text-sm font-semibold ${
                    experience.is_active ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {experience.is_active ? "Oui" : "Non"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Publish/Unpublish confirmation modal */}
      <ConfirmModal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={() => {
          const mutation = experience.is_published
            ? unpublishMutation
            : publishMutation;
          mutation.mutate(id, {
            onSuccess: () => setShowPublishModal(false),
          });
        }}
        title={
          experience.is_published
            ? "Mettre en brouillon"
            : "Publier l'expérience"
        }
        message={
          experience.is_published
            ? `Êtes-vous sûr de vouloir mettre en brouillon « ${experience.title} » ? Elle ne sera plus visible publiquement.`
            : `Êtes-vous sûr de vouloir publier « ${experience.title} » ? Elle sera visible par tous les utilisateurs.`
        }
        confirmLabel={
          experience.is_published ? "Mettre en brouillon" : "Publier"
        }
        cancelLabel="Annuler"
        variant={experience.is_published ? "danger" : "default"}
        loading={publishMutation.isPending || unpublishMutation.isPending}
      />
      {/* Delete confirmation modal */}
      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          deleteMutation.mutate(id, {
            onSuccess: () => {
              setShowDeleteModal(false);
              router.push(localizedPath("/me/experiences"));
            },
          });
        }}
        title="Supprimer l'expérience"
        message={`Êtes-vous sûr de vouloir supprimer « ${experience.title} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
