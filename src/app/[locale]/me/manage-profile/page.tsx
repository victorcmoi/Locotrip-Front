"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/services/users/getUser";
import { useGuideByUserId } from "@/services/guides/getGuideByUserId";
import { MinioHelpers } from "@/utils/minio";
import Image from "next/image";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

export default function ManageProfilePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const isGuide = session?.user?.role === "guide";

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
            <div className="bg-accent text-light rounded-full w-24 h-24 flex items-center justify-center font-bold text-3xl shrink-0 overflow-hidden relative">
              {isGuide ? (
                <Image
                  src={MinioHelpers.guideProfile(
                    guide?.id,
                    guide?.medias?.[0]?.url,
                  )}
                  alt={`${guide?.user?.first_name} ${guide?.user?.last_name}`}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              ) : (
                userInitials
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
            <h2 className="text-xl font-bold text-dark mb-4 border-b border-black/5 pb-2">
              Informations Globales
            </h2>
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
              <h2 className="text-xl font-bold text-dark mb-4 border-b border-black/5 pb-2">
                Informations Guide
              </h2>
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
    </div>
  );
}
