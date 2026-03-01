"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/services/users/getUser";
import { useGuideByUserId } from "@/services/guides/getGuideByUserId";
import { useUpdateUser } from "@/services/users/updateUser";
import { useUpdateGuide } from "@/services/guides/updateGuide";
import { MinioHelpers } from "@/utils/minio";
import Image from "next/image";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { Pencil, Camera } from "lucide-react";
import EditUserModal from "@/components/ui/users/EditUserModal";
import EditGuideModal from "@/components/ui/guides/EditGuideModal";
import EditProfilePictureModal from "@/components/ui/guides/EditProfilePictureModal";
import type { UpdateUser } from "@/schemas/user";
import type { UpdateGuide } from "@/schemas/guide";

dayjs.locale("fr");

export default function ManageProfilePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const isGuide = session?.user?.role === "guide";

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);

  const {
    data: user,
    isLoading: isLoadingUser,
    error: errorUser,
  } = useUser(userId);

  const {
    data: guide,
    isLoading: isLoadingGuide,
    error: errorGuide,
  } = useGuideByUserId(isGuide ? userId : undefined);

  const userInitials =
    (user?.first_name?.charAt(0).toUpperCase() || "") +
    (user?.last_name?.charAt(0).toUpperCase() || "");

  const updateUserMutation = useUpdateUser(userId);
  const updateGuideMutation = useUpdateGuide(guide?.id, userId);

  const handleSaveUser = async (data: UpdateUser) => {
    await updateUserMutation.mutateAsync(data);
  };

  const handleSaveGuide = async (data: UpdateGuide) => {
    await updateGuideMutation.mutateAsync(data);
  };

  if (!session) {
    return null; // Layout handles redirect
  }

  return (
    <div>
      <div className="my-12">
        <h1 className="text-3xl font-extrabold text-dark !text-left mb-1">
          Votre profil
        </h1>
        <p className="text-lg text-dark/80 font-normal">
          Consultez et gérez vos informations personnelles
        </p>
      </div>

      {(isLoadingUser || (isGuide && isLoadingGuide)) && (
        <p className="text-dark/60">Chargement de votre profil...</p>
      )}

      {errorUser && (
        <p className="text-red-600">
          Erreur lors du chargement de vos informations globales.
        </p>
      )}

      {isGuide && errorGuide && (
        <p className="text-red-600">
          Erreur lors du chargement de vos informations de guide.
        </p>
      )}

      {!isLoadingUser && user && (
        <div className="flex flex-col gap-8">
          {/* En-tête de profil */}
          <div className="flex items-center gap-6 bg-white rounded-2xl p-6 shadow-sm border border-black/5">
            <div className="relative shrink-0">
              <div className="bg-accent text-light rounded-full w-24 h-24 flex items-center justify-center font-bold text-3xl overflow-hidden relative">
                {isGuide ? (
                  <Image
                    src={MinioHelpers.guideProfile(
                      guide?.id,
                      guide?.medias?.[0]?.url,
                    )}
                    alt={`${guide?.user?.first_name} ${guide?.user?.last_name}`}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  userInitials
                )}
              </div>
              {isGuide && (
                <button
                  type="button"
                  onClick={() => setIsPictureModalOpen(true)}
                  className="absolute bottom-0 right-0 bg-accent text-white rounded-full p-1.5 shadow-md hover:bg-accent/90 transition-colors cursor-pointer border-2 border-white"
                  title="Modifier la photo"
                >
                  <Camera size={14} />
                </button>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-dark/60 font-medium capitalize mt-1">
                {user.role}
              </p>
            </div>
          </div>

          {/* Informations Globales */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
              <h2 className="text-xl font-bold text-dark">
                Informations Globales
              </h2>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(true)}
                className="flex bg-transparent items-center gap-2 px-4 py-2 rounded-lg border border-accent text-accent font-semibold text-sm hover:bg-accent hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <Pencil size={15} />
                Modifier
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-dark/60 font-medium mb-1">Prénom</p>
                <p className="font-semibold text-dark">
                  {user.first_name || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark/60 font-medium mb-1">Nom</p>
                <p className="font-semibold text-dark">
                  {user.last_name || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark/60 font-medium mb-1">Email</p>
                <p className="font-semibold text-dark">{user.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-dark/60 font-medium mb-1">
                  Téléphone
                </p>
                <p className="font-semibold text-dark">
                  {user.phone || "Non renseigné"}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark/60 font-medium mb-1">Rôle</p>
                <p className="font-semibold text-dark capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>

          {/* Informations Guide */}
          {isGuide && guide && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
              <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
                <h2 className="text-xl font-bold text-dark">
                  Informations Guide
                </h2>
                <button
                  type="button"
                  onClick={() => setIsGuideModalOpen(true)}
                  className="flex bg-transparent items-center gap-2 px-4 py-2 rounded-lg border border-accent text-accent font-semibold text-sm hover:bg-accent hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  <Pencil size={15} />
                  Modifier
                </button>
              </div>
              <div className="gap-6 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-dark/60 font-medium mb-1">
                      Pays
                    </p>
                    <p className="font-semibold text-dark">
                      {guide.country || "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark/60 font-medium mb-1">
                      Langues
                    </p>
                    <p className="font-semibold text-dark">
                      {guide.languages || "Non renseignées"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark/60 font-medium mb-1">
                      Années d&apos;expérience
                    </p>
                    <p className="font-semibold text-dark">
                      {guide.years_of_experience ?? 0} an(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark/60 font-medium mb-1">
                      Carte Professionnelle
                    </p>
                    <p className="font-semibold text-dark">
                      {guide.pro_card ? "Oui" : "Non"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark/60 font-medium mb-1">
                      Statut
                    </p>
                    <p className="font-semibold text-dark capitalize">
                      {guide.guide_status}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-dark/60 font-medium mb-1">
                    Biographie
                  </p>
                  <p className="text-dark bg-light p-4 rounded-xl text-sm leading-relaxed mt-1">
                    {guide.bio || "Aucune biographie."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {user && (
        <EditUserModal
          open={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          user={user}
          onSave={handleSaveUser}
          loading={updateUserMutation.isPending}
        />
      )}

      {guide && (
        <EditGuideModal
          open={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
          guide={guide}
          onSave={handleSaveGuide}
          loading={updateGuideMutation.isPending}
        />
      )}

      {guide && userId && (
        <EditProfilePictureModal
          open={isPictureModalOpen}
          onClose={() => setIsPictureModalOpen(false)}
          guideId={guide.id}
          userId={userId}
          currentImageUrl={MinioHelpers.guideProfile(
            guide.id,
            guide.medias?.[0]?.url,
          )}
          previousMediaId={guide.medias?.[0]?.id ?? null}
        />
      )}
    </div>
  );
}
