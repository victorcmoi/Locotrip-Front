'use client';

import { redirect } from "next/navigation";
import React from "react";
import Link from "next/link";
import { checkLogin } from "@/lib/auth";
import LoginForm from "@/components/auth/FormLogin";
import { HOME_ROUTES, SUPPORT_ROUTES } from "@/utils/routes";
import { useTranslations, useLocalizedPath } from "@/providers/i18n.provider";

export default function Page() {
  const dict = useTranslations();
  const localizedPath = useLocalizedPath();

  return (
    <div className="flex min-h-screen flex-1">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-8 text-2xl/9 font-bold tracking-tight text-gray-900">
              {dict.auth.login}
            </h2>
            <p className="mt-2 text-sm/6 text-gray-500">
              Un problème ?{' '}
              <Link 
                href={localizedPath(SUPPORT_ROUTES.CONTACT)} 
                className="font-semibold text-green-600 hover:text-green-500"
              >
                {dict.navigation.contact}
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
