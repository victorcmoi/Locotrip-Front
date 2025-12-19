import { redirect } from "next/navigation";
import React from "react";
import { checkLogin } from "@/lib/auth";
import LoginForm from "@/components/auth/FormLogin";
import { Link } from "@/i18n/navigation";
import { HOME_ROUTES } from "@/utils/routes";
import { useTranslations } from "next-intl";

export default async function Page() {
  if (await checkLogin()) {
    redirect(HOME_ROUTES.HOME);
  }

  const t = useTranslations('auth');

  return (
    <div className="flex min-h-screen flex-1">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-8 text-2xl/9 font-bold tracking-tight text-gray-900">
              {t('loginTitle', { default: 'Connectez-vous à votre compte' })}
            </h2>
            <p className="mt-2 text-sm/6 text-gray-500">
              Un problème ?{' '}
              <Link href="#" className="font-semibold text-green-600 hover:text-green-500">
                Contactez-nous
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
