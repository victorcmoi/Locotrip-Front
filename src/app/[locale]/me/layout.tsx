"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useLocalizedPath, useTranslations } from "@/providers/i18n.provider";
import { useGuideByUserId } from "@/services/guides/getGuideByUserId";
import { MinioHelpers } from "@/utils/minio";
import Image from "next/image";
import {
  Ticket,
  MessageCircleMore,
  User,
  CircleHelp,
  ArrowLeft,
} from "lucide-react";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const dict = useTranslations();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const localizedPath = useLocalizedPath();
  const isGuide = session?.user?.role === "guide";
  const userMenuItems = [
    {
      label: dict.navigation.myBookings,
      href: "/me/bookings",
      icon: Ticket,
    },
    {
      label: dict.navigation.messaging,
      href: "/me/messages",
      icon: MessageCircleMore,
    },
    {
      label: dict.navigation.profileManagement,
      href: "/me/manage-profile",
      icon: User,
    },
    {
      label: dict.navigation.support,
      href: "/help",
      icon: CircleHelp,
    },
  ];

  const guideMenuItems = [
    {
      label: dict.navigation.myBookings,
      href: "/me/bookings",
      icon: Ticket,
    },
    {
      label: dict.navigation.experiences,
      href: "/me/experiences",
      icon: Ticket,
    },
    {
      label: dict.navigation.messaging,
      href: "/me/messages",
      icon: MessageCircleMore,
    },
    {
      label: dict.navigation.profileManagement,
      href: "/me/manage-profile",
      icon: User,
    },
    {
      label: dict.navigation.support,
      href: "/help",
      icon: CircleHelp,
    },
  ];

  const menuItems = isGuide ? guideMenuItems : userMenuItems;

  const { data: guide } = useGuideByUserId(
    isGuide ? session?.user?.id : undefined,
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(localizedPath("/login"));
    }
  }, [status, router, localizedPath]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-dark/60">{dict.common.loading}</p>
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
    <div className="flex flex-col lg:flex-row bg-light min-h-[80vh]">
      {/* Sidebar */}
      <aside className="w-full lg:w-85 shrink-0 py-4 lg:py-12 h-auto lg:h-[85vh] lg:sticky lg:top-16 z-20">
        <nav className="bg-black-accent lg:rounded-r-2xl p-4 lg:p-6 flex flex-col h-full shadow-sm">
          {/* Retour au site */}
          <Link
            href="/"
            className="flex items-center gap-3 text-sm text-white transition mb-6 font-normal"
          >
            <ArrowLeft size={14} />
            {dict.common.backToSite}
          </Link>

          {/* User info */}
          <div className="flex items-center gap-3 my-4 lg:my-8 border-b border-white/20 pb-4 lg:pb-8">
            <div className="bg-accent text-light rounded-full w-14 h-14 flex items-center justify-center font-semibold text-sm shrink-0 overflow-hidden relative">
              {isGuide && guide?.medias?.[0]?.url ? (
                <Image
                  src={MinioHelpers.guideProfile(guide.id, guide.medias[0].url)}
                  alt={`${session?.user?.first_name} ${session?.user?.last_name}`}
                  fill
                  className="object-cover"
                />
              ) : (
                userInitials
              )}
            </div>
            <Link href={localizedPath("/me/manage-profile")} className="">
              <p className="font-semibold text-sm text-white">
                {session?.user?.first_name} {session?.user?.last_name}
              </p>
              <p className="font-semibold text-sm text-white/70">
                {isGuide ? dict.common.guideRole : dict.common.userRole}
              </p>
            </Link>
          </div>

          {/* Menu items */}
          <div className="flex flex-row lg:flex-col gap-1 flex-1 overflow-x-auto lg:overflow-visible">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={localizedPath(item.href)}
                  className={`flex text-white items-center gap-3 px-3 py-2.5 lg:py-3 rounded-xl transition font-normal text-sm md:text-base lg:text-lg whitespace-nowrap ${
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
            className="mt-4 lg:mt-8 text-sm text-left text-white font-bold px-3 py-2.5 lg:py-3 bg-transparent border border-white rounded-lg transition cursor-pointer"
          >
            {dict.auth.logout}
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
