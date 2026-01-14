"use client";

import React, {useState} from "react";
import {signIn} from "next-auth/react";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import { HOME_ROUTES, AUTH_ROUTES } from "@/utils/routes";
import { useTranslations, useLocalizedPath } from "@/providers/i18n.provider";
import Link from "next/link";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const dict = useTranslations();
  const localizedPath = useLocalizedPath();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLoading(true);
        signIn("credentials", {
          redirect: false,
          email: e.currentTarget.email.value,
          password: e.currentTarget.password.value,
        }).then(({error}: any) => {
          if (error) {
            setLoading(false);
            toast.error(error);
          } else {
            router.replace(localizedPath(HOME_ROUTES.HOME));
          }
        });
      }}
      className="space-y-6"
    >
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
          autoComplete="current-password"
          className="w-full px-4 py-3 rounded-xl border border-gray-light bg-white text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          placeholder="••••••••"
        />
      </div>

      {/* Remember me & Forgot password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center cursor-pointer">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-light text-accent focus:ring-accent cursor-pointer"
          />
          <span className="ml-2 text-sm text-dark">Rester connecté</span>
        </label>

        <Link 
          href={localizedPath(HOME_ROUTES.HOME)} 
          className="text-sm font-semibold text-accent hover:text-primary transition-colors"
        >
          {dict.auth.forgotPassword}
        </Link>
      </div>

      {/* Submit button */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-accent text-white font-bold py-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-button cursor-pointer"
        >
          {loading ? "Connexion en cours..." : dict.auth.login}
        </button>
      </div>

      {/* Lien vers register */}
      <div className="text-center">
        <p className="text-sm text-dark">
          {dict.auth.noAccountYet}{' '}
          <Link 
            href={localizedPath(AUTH_ROUTES.REGISTER)} 
            className="font-semibold text-accent hover:text-primary transition-colors"
          >
            {dict.auth.register}
          </Link>
        </p>
      </div>
    </form>
  );
}
