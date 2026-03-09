"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { HOME_ROUTES, AUTH_ROUTES } from "@/utils/routes";
import { useTranslations, useLocalizedPath } from "@/providers/i18n.provider";
import Link from "next/link";
import { useRegisterGuide } from "@/services/auth/registerGuide";

export default function FormGuideRegister() {
  const registerGuideMutation = useRegisterGuide();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const router = useRouter();
  const dict = useTranslations();
  const localizedPath = useLocalizedPath();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const birthDateStr = formData.get("birthDate") as string;
    const phone = formData.get("phone") as string;
    const bio = formData.get("bio") as string;
    const country = formData.get("country") as string;
    const languages = formData.get("languages") as string;
    const yearsOfExperience = parseInt(
      formData.get("yearsOfExperience") as string,
      10,
    );

    // Validation mot de passe
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (!acceptTerms) {
      toast.error("Vous devez accepter les conditions générales");
      return;
    }

    // Validation âge (18+)
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      toast.error("Vous devez avoir au moins 18 ans pour vous inscrire.");
      return;
    }

    // Validation bio
    if (bio.length < 50) {
      toast.error("La biographie doit contenir au moins 50 caractères.");
      return;
    }

    try {
      await registerGuideMutation.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        birth_date: birthDateStr,
        bio,
        country,
        languages,
        years_of_experience: yearsOfExperience,
        ...(phone ? { phone } : {}),
      });

      // Connexion automatique après inscription
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Compte guide créé avec succès !");
        router.replace(localizedPath(HOME_ROUTES.HOME));
      }
    } catch (error: any) {
      toast.error(
        error.message || "Une erreur est survenue lors de l'inscription",
      );
    }
  };

  const inputClasses =
    "w-full px-4 py-3 rounded-xl border border-gray-light bg-white text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all";
  const labelClasses = "block text-base font-semibold text-dark mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ===== Section 1: Informations personnelles ===== */}
      <div>
        <h3 className="text-xl font-bold text-primary mb-4 pb-2 border-b border-gray-light">
          {dict.auth.personalInfo || "Informations personnelles"}
        </h3>

        <div className="space-y-5 mt-4">
          {/* Prénom et Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={labelClasses}>
                {dict.auth.firstName}
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                autoComplete="given-name"
                className={inputClasses}
                placeholder="Jean"
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClasses}>
                {dict.auth.lastName}
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                autoComplete="family-name"
                className={inputClasses}
                placeholder="Dupont"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClasses}>
              {dict.auth.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClasses}
              placeholder="exemple@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className={labelClasses}>
              {dict.auth.password}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              className={inputClasses}
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className={labelClasses}>
              {dict.auth.confirmPassword}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              className={inputClasses}
              placeholder="••••••••"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className={labelClasses}>
              {dict.auth.phone || "Numéro de téléphone (optionnel)"}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={inputClasses}
              placeholder="+33612345678"
            />
          </div>

          {/* Birth Date */}
          <div>
            <label htmlFor="birthDate" className={labelClasses}>
              {dict.auth.birthDate || "Date de naissance"}
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              required
              autoComplete="bday"
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      {/* ===== Section 2: Informations guide ===== */}
      <div>
        <h3 className="text-xl font-bold text-primary mb-4 pb-2 border-b border-gray-light">
          {dict.auth.guideInfo || "Informations guide"}
        </h3>

        <div className="space-y-5 mt-4">
          {/* Bio */}
          <div>
            <label htmlFor="bio" className={labelClasses}>
              {dict.auth.bio || "Biographie"}
            </label>
            <textarea
              id="bio"
              name="bio"
              required
              rows={4}
              minLength={50}
              className={`${inputClasses} resize-none`}
              placeholder={
                dict.auth.bioPlaceholder ||
                "Présentez-vous en quelques mots : votre parcours, vos passions, ce que vous aimez partager avec les voyageurs... (minimum 50 caractères)"
              }
            />
            <p className="text-xs text-gray mt-1">Minimum 50 caractères</p>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className={labelClasses}>
              {dict.auth.country || "Pays"}
            </label>
            <input
              id="country"
              name="country"
              type="text"
              required
              className={inputClasses}
              placeholder="France"
            />
          </div>

          {/* Languages */}
          <div>
            <label htmlFor="languages" className={labelClasses}>
              {dict.auth.languages || "Langues parlées"}
            </label>
            <input
              id="languages"
              name="languages"
              type="text"
              required
              className={inputClasses}
              placeholder="Français, Anglais, Espagnol"
            />
            <p className="text-xs text-gray mt-1">
              Séparez les langues par des virgules
            </p>
          </div>

          {/* Years of experience */}
          <div>
            <label htmlFor="yearsOfExperience" className={labelClasses}>
              {dict.auth.yearsOfExperience || "Années d'expérience"}
            </label>
            <input
              id="yearsOfExperience"
              name="yearsOfExperience"
              type="number"
              required
              min={0}
              max={99}
              className={inputClasses}
              placeholder="5"
            />
          </div>

          {/* Profile Picture */}
          <div>
            <label htmlFor="profilePicture" className={labelClasses}>
              {dict.auth.profilePicture || "Photo de profil"}
            </label>
            <input
              id="profilePicture"
              name="profilePicture"
              type="file"
              accept="image/*"
              className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer`}
            />
            <p className="text-xs text-gray mt-1">
              {dict.auth.profilePictureHint ||
                "Vous pourrez modifier votre photo de profil depuis votre espace personnel"}
            </p>
          </div>
        </div>
      </div>

      {/* Accept terms */}
      <div>
        <label className="flex items-start cursor-pointer">
          <input
            id="accept-terms"
            name="accept-terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-4 h-4 mt-1 rounded border-gray-light text-accent focus:ring-accent cursor-pointer shrink-0"
          />
          <span className="ml-2 text-sm text-dark">
            {dict.auth.acceptTerms}
          </span>
        </label>
      </div>

      {/* Newsletter */}
      <div>
        <label className="flex items-center cursor-pointer">
          <input
            id="subscribe-newsletter"
            name="subscribe-newsletter"
            type="checkbox"
            checked={subscribeNewsletter}
            onChange={(e) => setSubscribeNewsletter(e.target.checked)}
            className="w-4 h-4 rounded border-gray-light text-accent focus:ring-accent cursor-pointer"
          />
          <span className="ml-2 text-sm text-dark">
            {dict.auth.subscribeNewsletter}
          </span>
        </label>
      </div>

      {/* Submit button */}
      <div>
        <button
          type="submit"
          disabled={registerGuideMutation.isPending}
          className="w-full bg-primary hover:bg-accent text-white font-bold py-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-button cursor-pointer"
        >
          {registerGuideMutation.isPending
            ? "Inscription en cours..."
            : dict.auth.guideRegisterButton || "Créer mon compte guide"}
        </button>
      </div>

      {/* Link to login */}
      <div className="text-center">
        <p className="text-sm text-dark">
          {dict.auth.alreadyHaveAccount}{" "}
          <Link
            href={localizedPath(AUTH_ROUTES.LOGIN)}
            className="font-semibold text-accent hover:text-primary transition-colors"
          >
            {dict.auth.login}
          </Link>
        </p>
      </div>
    </form>
  );
}
