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
import {
  Pencil,
  Camera,
  Crown,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
} from "lucide-react";
import EditUserModal from "@/components/ui/users/EditUserModal";
import EditGuideModal from "@/components/ui/guides/EditGuideModal";
import EditProfilePictureModal from "@/components/ui/guides/EditProfilePictureModal";
import RequestProModal from "@/components/ui/guides/RequestProModal";
import { useResubmitGuideDocument } from "@/services/guides/resubmitGuideDocument";
import { toast } from "sonner";
import type { UpdateUser } from "@/schemas/user";
import type { UpdateGuide } from "@/schemas/guide";
import { useTranslations } from "@/providers/i18n.provider";

dayjs.locale("fr");

function ResubmitButton({
  guideId,
  documentId,
  userId,
}: {
  guideId: string;
  documentId: string;
  userId: string;
}) {
  const dict = useTranslations();
  const resubmitMutation = useResubmitGuideDocument(userId);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleResubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await resubmitMutation.mutateAsync({ guideId, documentId, file });
      toast.success(dict.profile.documentResubmittedSuccess);
    } catch {
      toast.error(dict.profile.documentResubmittedError);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <label className="cursor-pointer">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        disabled={resubmitMutation.isPending}
        onChange={handleResubmit}
      />
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors cursor-pointer">
        <Upload size={12} />
        {resubmitMutation.isPending ? dict.profile.sending : dict.profile.resubmit}
      </span>
    </label>
  );
}

export default function ManageProfilePage() {
  const dict = useTranslations();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const isGuide = session?.user?.role === "guide";

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

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

  const isAlreadyPro = guide?.guide_status === "pro";

  // Déterminer si une demande pro est en cours (uniquement si le guide n'est pas déjà pro)
  const hasPendingProRequest =
    !isAlreadyPro &&
    guide?.documents?.some(
      (doc) =>
        doc.document_type === "guide_card" &&
        doc.verification_status === "pending",
    );

  const canRequestPro =
    isGuide && guide && !isAlreadyPro && !hasPendingProRequest;

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
        <h1 className="text-3xl font-extrabold text-dark text-left! mb-1">
          {dict.profile.yourProfile}
        </h1>
        <p className="text-lg text-dark/80 font-normal">
          {dict.profile.profileSubtitle}
        </p>
      </div>

      {(isLoadingUser || (isGuide && isLoadingGuide)) && (
        <p className="text-dark/60">{dict.profile.loadingProfile}</p>
      )}

      {errorUser && (
        <p className="text-red-600">
          {dict.profile.globalInfoError}
        </p>
      )}

      {isGuide && errorGuide && (
        <p className="text-red-600">
          {dict.profile.guideInfoError}
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
                  title={dict.profile.editPhoto}
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
                {dict.profile.globalInfo}
              </h2>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(true)}
                className="flex bg-transparent items-center gap-2 px-4 py-2 rounded-lg border border-accent text-accent font-semibold text-sm hover:bg-accent hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <Pencil size={15} />
                {dict.common.edit}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-dark/60 font-medium mb-1">{dict.auth.firstName}</p>
                <p className="font-semibold text-dark">
                  {user.first_name || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark/60 font-medium mb-1">{dict.auth.lastName}</p>
                <p className="font-semibold text-dark">
                  {user.last_name || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark/60 font-medium mb-1">{dict.auth.email}</p>
                <p className="font-semibold text-dark">{user.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-dark/60 font-medium mb-1">
                  {dict.profile.phone}
                </p>
                <p className="font-semibold text-dark">
                  {user.phone || dict.profile.notProvided}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark/60 font-medium mb-1">{dict.profile.role}</p>
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
                {dict.profile.guideInfo}
              </h2>
                <div className="flex items-center gap-3">
                  {isAlreadyPro && (
                    <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent border border-accent/20 text-white font-semibold text-sm shadow-sm">
                      <Crown size={15} />
                      {dict.profile.proGuide}
                    </span>
                  )}
                  {hasPendingProRequest && (
                    <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm">
                      <Clock size={15} />
                      {dict.profile.proRequestPending}
                    </span>
                  )}
                  {canRequestPro && (
                    <button
                      type="button"
                      onClick={() => setIsProModalOpen(true)}
                      className="flex bg-transparent items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 font-semibold text-sm hover:bg-emerald-500 hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      <Crown size={15} />
                      {dict.profile.becomePro}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsGuideModalOpen(true)}
                    className="flex bg-transparent items-center gap-2 px-4 py-2 rounded-lg border border-accent text-accent font-semibold text-sm hover:bg-accent hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <Pencil size={15} />
                    {dict.common.edit}
                  </button>
                </div>
              </div>
              <div className="gap-6 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-dark/60 font-medium mb-1">
                      {dict.profile.country}
                    </p>
                    <p className="font-semibold text-dark">
                      {guide.country || dict.profile.notProvided}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark/60 font-medium mb-1">
                      {dict.common.languages}
                    </p>
                    <p className="font-semibold text-dark">
                      {guide.languages || dict.profile.notProvided}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark/60 font-medium mb-1">
                      {dict.profile.yearsOfExperience}
                    </p>
                    <p className="font-semibold text-dark">
                      {guide.years_of_experience ?? 0} {dict.profile.yearsUnit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark/60 font-medium mb-1">
                      {dict.profile.proCardLabel}
                    </p>
                    <p className="font-semibold text-dark">
                      {guide.pro_card ? dict.common.yes : dict.common.no}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark/60 font-medium mb-1">
                      {dict.profile.statusLabel}
                    </p>
                    <p className="font-semibold text-dark capitalize">
                      {guide.guide_status}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-dark/60 font-medium mb-1">
                    {dict.profile.biography}
                  </p>
                  <p className="text-dark bg-light p-4 rounded-xl text-sm leading-relaxed mt-1">
                    {guide.bio || dict.profile.noBio}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section Ma demande pro */}
          {isGuide &&
            guide &&
            hasPendingProRequest &&
            (() => {
              const proDocuments =
                guide.documents?.filter(
                  (doc) => doc.document_type !== "guide_card",
                ) || [];

              const getDocTypeName = (type: string) => {
                switch (type) {
                  case "CV":
                    return dict.profile.docTypeCV;
                  case "diploma":
                    return dict.profile.docTypeDiploma;
                  case "proof_of_residence":
                    return dict.profile.docTypeProofResidence;
                  case "guide_card":
                    return dict.profile.docTypeProCard;
                  default:
                    return type;
                }
              };

              const getStatusBadge = (status: string) => {
                switch (status) {
                  case "verified":
                    return (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                        <CheckCircle size={12} /> {dict.profile.verified}
                      </span>
                    );
                  case "rejected":
                    return (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                        <XCircle size={12} /> {dict.profile.rejected}
                      </span>
                    );
                  default:
                    return (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                        <Clock size={12} /> {dict.profile.pending}
                      </span>
                    );
                }
              };

              return proDocuments.length > 0 ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
                  <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
                    <h2 className="text-xl font-bold text-dark">
                      {dict.profile.proRequest}
                    </h2>
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-xs">
                      <Clock size={13} />
                      {dict.profile.proRequestProcessing}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {proDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-light border border-black/5"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-dark/40" />
                          <div>
                            <p className="text-sm font-semibold text-dark">
                              {getDocTypeName(doc.document_type)}
                            </p>
                            {doc.verification_comment &&
                              doc.verification_status === "rejected" && (
                                <p className="text-xs text-red-500 mt-0.5">
                                  {doc.verification_comment}
                                </p>
                              )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(doc.verification_status)}
                          {doc.verification_status === "rejected" &&
                            guide &&
                            userId && (
                              <ResubmitButton
                                guideId={guide.id}
                                documentId={doc.id}
                                userId={userId}
                              />
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
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

      {guide && userId && canRequestPro && (
        <RequestProModal
          open={isProModalOpen}
          onClose={() => setIsProModalOpen(false)}
          guide={guide}
          userId={userId}
        />
      )}
    </div>
  );
}
