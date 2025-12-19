import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations('home');

  return (
    <div className="flex min-h-screen p-8 gap-8 ">
      <main className="flex-1">
        <h1 className="text-3xl font-bold mb-4">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('subtitle')}
        </p>
      </main>
    </div>
  );
}
