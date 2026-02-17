import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "../globals.css";
import Header from "@/components/common/Header";
import NextAuthProvider from "@/providers/auth.provider";
import QueryClientProvider from "@/providers/query-client.provider";
import { I18nProvider } from "@/providers/i18n.provider";
import { getDictionary, hasLocale } from "./dictionnaries";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import Footer from "@/components/common/Footer";
import AuthHandler from "@/components/auth/AuthHandler";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Locotrip",
  description: "Plateforme de mise en relation pour voyager toute sérénité",
};

export async function generateStaticParams() {
  return [{ lang: "en-US" }, { lang: "de" }];
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body className={`${raleway.variable} antialiased`}>
        <QueryClientProvider>
          <NextAuthProvider>
            <AuthHandler>
              <I18nProvider locale={locale} dict={dict}>
                <Header />
                {children}
                <Toaster richColors />
                <Footer />
              </I18nProvider>
            </AuthHandler>
          </NextAuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
