import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "../styles/globals.css"
import Header from "@/components/common/Header";
import NextAuthProvider from "@/providers/auth.provider";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Locotrip",
  description: "Plateforme de mise en relation pour voyager toute sérénité",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${raleway.variable} antialiased`}>
        <NextAuthProvider>
          <Header />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
