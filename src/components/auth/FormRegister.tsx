"use client";

import React, {useState} from "react";
import {signIn} from "next-auth/react";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import { HOME_ROUTES, AUTH_ROUTES } from "@/utils/routes";
import { useTranslations, useLocalizedPath } from "@/providers/i18n.provider";
import Link from "next/link";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const router = useRouter();
  const dict = useTranslations();
  const localizedPath = useLocalizedPath();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validation
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (!acceptTerms) {
      toast.error("Vous devez accepter les conditions générales");
      return;
    }

    setLoading(true);

    try {
      // TODO: Appel API pour créer le compte
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ firstName, lastName, email, password, subscribeNewsletter })
      // });

      // if (!response.ok) {
      //   throw new Error('Erreur lors de l\'inscription');
      // }

      // Connexion automatique après inscription
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
      } else {
        toast.success("Compte créé avec succès !");
        router.replace(localizedPath(HOME_ROUTES.HOME));
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'inscription");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Prénom et Nom */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-base font-semibold text-dark mb-2">
            {dict.auth.firstName}
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            className="w-full px-4 py-3 rounded-xl border border-gray-light bg-white text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            placeholder="Jean"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-base font-semibold text-dark mb-2">
            {dict.auth.lastName}
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            autoComplete="family-name"
            className="w-full px-4 py-3 rounded-xl border border-gray-light bg-white text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            placeholder="Dupont"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-base font-semibold text-dark mb-2">
          {dict.auth.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-4 py-3 rounded-xl border border-gray-light bg-white text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          placeholder="exemple@email.com"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-base font-semibold text-dark mb-2">
          {dict.auth.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="w-full px-4 py-3 rounded-xl border border-gray-light bg-white text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          placeholder="••••••••"
        />
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-base font-semibold text-dark mb-2">
          {dict.auth.confirmPassword}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full px-4 py-3 rounded-xl border border-gray-light bg-white text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          placeholder="••••••••"
        />
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
          disabled={loading}
          className="w-full bg-primary hover:bg-accent text-white font-bold py-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-button cursor-pointer" 
        >
          {loading ? "Inscription en cours..." : dict.auth.register}
        </button>
      </div>

      {/* Lien vers login */}
      <div className="text-center">
        <p className="text-sm text-dark">
          {dict.auth.alreadyHaveAccount}{' '}
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
