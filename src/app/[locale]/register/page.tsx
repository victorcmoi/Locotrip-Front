'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import RegisterForm from "@/components/auth/FormRegister";
import { HOME_ROUTES, SUPPORT_ROUTES } from "@/utils/routes";
import { useTranslations, useLocalizedPath } from "@/providers/i18n.provider";

export default function Page() {
  const dict = useTranslations();
  const localizedPath = useLocalizedPath();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{background: "linear-gradient(180deg, #205352 0%, #FCC13D 100%)"}}>
      <div className="max-w-xl w-full space-y-8 bg-white rounded-2xl shadow-xl p-10">    
        {/* Titre */}
        <div className="text-left">
          <h2 className="text-3xl font-bold text-dark mb-2">
            {dict.auth.registerTitle}
          </h2>
          <p className="text-base text-gray">
            {dict.auth.haveProblem}{' '}
            <Link 
              href={localizedPath(SUPPORT_ROUTES.CONTACT)} 
              className="font-semibold text-accent hover:text-primary transition-colors"
            >
              {dict.auth.contactUs}
            </Link>
          </p>
        </div>

        {/* Formulaire */}
        <div className="mt-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
