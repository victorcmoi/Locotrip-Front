import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "../../styles/globals.css"
import Header from "@/components/common/Header";
import NextAuthProvider from "@/providers/auth.provider";
import QueryClientProvider from "@/providers/query-client.provider";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Locotrip",
  description: "Plateforme de mise en relation pour voyager toute sérénité",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${raleway.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <QueryClientProvider>
            <NextAuthProvider>
              <Header />
              {children}
              <Toaster richColors />
            </NextAuthProvider>
          </QueryClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
