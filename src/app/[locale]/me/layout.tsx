"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useLocalizedPath } from "@/providers/i18n.provider";
import {
  Ticket,
  MessageCircleMore,
  User,
  CircleHelp,
  ArrowLeft,
} from "lucide-react";

const userMenuItems = [
  {
    label: "Réservations",
    href: "/me/bookings",
    icon: Ticket,
  },
  {
    label: "Messagerie",
    href: "/me/messages",
    icon: MessageCircleMore,
  },
  {
    label: "Gestion du profil",
    href: "/me/manage-profile",
    icon: User,
  },
  {
    label: "Support / aide",
    href: "/help",
    icon: CircleHelp,
  },
];

const guideMenuItems = [
  {
    label: "Réservations",
    href: "/me/bookings",
    icon: Ticket,
  },
  {
    label: "Expériences",
    href: "/me/experiences",
    icon: Ticket,
  },
  {
    label: "Messagerie",
    href: "/me/messages",
    icon: MessageCircleMore,
  },
  {
    label: "Gestion du profil",
    href: "/me/manage-profile",
    icon: User,
  },
  {
    label: "Support / aide",
    href: "/help",
    icon: CircleHelp,
  },
];

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const localizedPath = useLocalizedPath();
  const isGuide = session?.user?.role === "guide";
  const menuItems = isGuide ? guideMenuItems : userMenuItems;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(localizedPath("/login"));
    }
  }, [status, router, localizedPath]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-dark/60">Chargement...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: localizedPath("/") });
  };

  const userInitials =
    (session?.user?.first_name?.charAt(0).toUpperCase() || "") +
    (session?.user?.last_name?.charAt(0).toUpperCase() || "");

  const isActive = (href: string) => {
    const localHref = localizedPath(href);
    return pathname === localHref || pathname.startsWith(localHref);
  };

  return (
    <div className="flex bg-light min-h-[80vh]">
      {/* Sidebar */}
      <aside className="w-85 shrink-0 py-12 h-[85vh] sticky top-16">
        <nav className="bg-black-accent rounded-r-2xl p-6 flex flex-col h-full shadow-sm">
          {/* Retour au site */}
          <Link
            href={localizedPath("/")}
            className="flex items-center gap-3 text-sm text-white transition mb-6 font-normal"
          >
            <ArrowLeft size={14} />
            Retour au site
          </Link>

          {/* User info */}
          <div className="flex items-center gap-3 my-8 border-b border-white/20 pb-8">
            <div className="bg-accent text-light rounded-full w-10 h-10 flex items-center justify-center font-semibold text-sm shrink-0">
              {userInitials}
            </div>
            <Link href={localizedPath("/me/profile")} className="">
              <p className="font-semibold text-sm text-white">
                {session?.user?.first_name} {session?.user?.last_name}
              </p>
              <p className="font-semibold text-sm text-white/70">
                {session?.user?.role}
              </p>
            </Link>
          </div>

          {/* Menu items */}
          <div className="flex flex-col gap-1 flex-1">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={localizedPath(item.href)}
                  className={`flex text-white items-center gap-3 px-3 py-3 rounded-xl transition font-normal text-lg ${
                    active ? "font-bold" : "hover:font-bold"
                  }`}
                >
                  <item.icon
                    size={20}
                    className={
                      active ? "text-white stroke-2 duration-200" : "text-white"
                    }
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            className="mt-8 text-sm text-left text-white font-bold px-3 py-3 bg-transparent border border-white rounded-lg transition cursor-pointer"
          >
            Déconnexion
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 pt-6">{children}</main>
    </div>
  );
}
