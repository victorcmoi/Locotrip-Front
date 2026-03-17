"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MdLanguage } from "react-icons/md";
import { TfiHelpAlt } from "react-icons/tfi";
import { CiUser } from "react-icons/ci";
import { SlArrowDown } from "react-icons/sl";
import { LuMessageCircleMore, LuTicket } from "react-icons/lu";
import { IoNotificationsOutline } from "react-icons/io5";
import { HiMenu, HiX } from "react-icons/hi";
import {
  AUTH_ROUTES,
  HOME_ROUTES,
  BOOKINGS_ROUTES,
  USER_ROUTES,
  SUPPORT_ROUTES,
  GUIDES_ROUTES,
} from "@/utils/routes";
import { useTranslations, useLocalizedPath } from "@/providers/i18n.provider";
import { useCurrencies } from "@/services/currencies/getCurrencies";
import { useGuideByUserId } from "@/services/guides/getGuideByUserId";
import { MinioHelpers } from "@/utils/minio";
import { useNotifications } from "@/services/notifications/getNotifications";
import { useMarkNotificationRead } from "@/services/notifications/markNotificationRead";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

dayjs.locale("fr");
dayjs.extend(relativeTime);

export default function Header() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const dict = useTranslations();
  const localizedPath = useLocalizedPath();
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies();
  const router = useRouter();
  const pathname = usePathname();

  const isGuide = session?.user?.role === "guide";
  const { data: guide } = useGuideByUserId(
    isGuide ? session?.user?.id : undefined,
  );

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [langCurrencyTab, setLangCurrencyTab] = useState<
    "language" | "currency"
  >("language");

  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { data: notifications } = useNotifications(
    isAuthenticated ? session?.user?.id : undefined,
  );
  const { mutate: markAsRead } = useMarkNotificationRead();

  const handleNotificationClick = (id: string, read: boolean) => {
    if (!read) {
      markAsRead(id);
    }
  };

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setIsLangMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: localizedPath("/") });
  };

  const changeLanguage = (newLocale: string) => {
    const segments = pathname.split("/");
    const currentLocale = segments[1];

    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);

    router.push(newPathname);
    setIsLangMenuOpen(false);
  };

  return (
    <header className="w-full px-4 py-3 flex justify-between items-center sticky top-0 bg-light shadow-md z-50">
      <Link href={localizedPath(HOME_ROUTES.HOME)}>
        <Image
          src="/assets/logo_locotrip.png"
          alt="Locotrip Logo"
          width={200}
          height={40}
          priority
          className="w-28 sm:w-40 md:w-50 h-auto"
        />
      </Link>

      {/* Desktop nav — hidden on mobile */}
      <nav className="hidden md:flex items-center gap-2">
        {/* Menu Langue & Devise */}
        <div className="relative" ref={langMenuRef}>
          <div
            className="nav-item cursor-pointer"
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
          >
            <MdLanguage size={24} />
          </div>

          {isLangMenuOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-light rounded-xl shadow-xl min-w-150 sm:min-w-160 z-50">
              <div className="flex border-b border-gray-light">
                <button
                  onClick={() => setLangCurrencyTab("language")}
                  className={`flex-1 px-6 py-3 transition border-b-2 bg-white rounded-none rounded-tl-xl ${
                    langCurrencyTab === "language"
                      ? "border-accent font-semibold"
                      : "border-transparent hover:bg-gray-light/50"
                  }`}
                >
                  {dict.navigation.language}
                </button>
                <button
                  onClick={() => setLangCurrencyTab("currency")}
                  className={`flex-1 px-6 py-3 transition border-b-2 bg-white rounded-none rounded-tr-xl ${
                    langCurrencyTab === "currency"
                      ? "border-accent font-semibold"
                      : "border-transparent hover:bg-gray-light/50"
                  }`}
                >
                  {dict.navigation.currency}
                </button>
              </div>

              <div className="p-6">
                {langCurrencyTab === "language" ? (
                  <>
                    <h3 className="mb-6 font-bold text-2xl">
                      {dict.common.language}
                    </h3>
                    <button
                      onClick={() => changeLanguage("fr")}
                      className="w-full text-left p-3 hover:bg-gray-light rounded-lg bg-white cursor-pointer"
                    >
                      <Image src="/assets/flags/france.png" alt="Français" width={24} height={16} className="inline-block mr-3" />
                      {dict.navigation.french}
                    </button>
                    <button
                      onClick={() => changeLanguage("en")}
                      className="w-full text-left p-3 hover:bg-gray-light rounded-lg bg-white cursor-pointer"
                    >
                      <Image src="/assets/flags/royaume-uni.png" alt="English" width={24} height={16} className="inline-block mr-3" />
                      {dict.navigation.english}
                    </button>
                    <button
                      onClick={() => changeLanguage("sp")}
                      className="w-full text-left p-3 hover:bg-gray-light rounded-lg bg-white cursor-pointer"
                    >
                      <Image src="/assets/flags/espagne.png" alt="Spanish" width={24} height={16} className="inline-block mr-3" />
                      {dict.navigation.spanish}
                    </button>
                    <button
                      onClick={() => changeLanguage("de")}
                      className="w-full text-left p-3 hover:bg-gray-light rounded-lg bg-white cursor-pointer"
                    >
                      <Image src="/assets/flags/allemagne.png" alt="German" width={24} height={16} className="inline-block mr-3" />
                      {dict.navigation.german}
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="mb-6 font-bold text-2xl">
                      {dict.common.currency}
                    </h3>
                    {currenciesLoading ? (
                      <div className="p-4 text-center text-gray">
                        {dict.common.loading}
                      </div>
                    ) : currencies && currencies.length > 0 ? (
                      currencies.map((currency) => (
                        <button
                          key={currency.code}
                          className="w-full text-left p-3 hover:bg-gray-light rounded-lg bg-white cursor-pointer"
                        >
                          <span className="font-semibold text-accent">{currency.code}</span>{" "}
                          - {currency.name}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray">
                        {dict.common.noDevises}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {!isAuthenticated && (
          <div className="nav-item">
            <Link href={localizedPath(HOME_ROUTES.HELP)}>
              <TfiHelpAlt size={24} />
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <div className="nav-item">
            <Link href={localizedPath(HOME_ROUTES.MESSAGES)}>
              <LuMessageCircleMore size={24} />
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <div className="relative" ref={notificationsRef}>
            <div
              className="nav-item cursor-pointer relative"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <IoNotificationsOutline size={24} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>

            {isNotificationsOpen && (
              <div className="absolute top-10 right-0 mt-2 bg-white border border-gray-light rounded-xl shadow-xl w-80 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-light bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-base! text-gray-800">
                    {dict.common.notifications}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full font-semibold">
                      {unreadCount} {unreadCount > 1 ? dict.common.newPlural : dict.common.newSingular}
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {!notifications || notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      {dict.common.noNotifications}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications
                        .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
                        .map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif.id, notif.read)}
                            className={`p-4 border-b border-gray-light last:border-0 hover:bg-gray-50 transition cursor-pointer flex flex-col gap-1 ${
                              notif.read ? "opacity-70" : "bg-accent/5 font-semibold"
                            }`}
                          >
                            <p className={`text-sm ${notif.read ? "text-gray-700" : "text-gray-900"}`}>
                              {notif.content}
                            </p>
                            <span className="text-xs text-gray-400">
                              {dayjs(notif.sent_at).fromNow()}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {notifications && notifications.length > 0 && (
                  <div className="p-2 border-t border-gray-light bg-gray-50 text-center">
                    <button
                      onClick={() => {
                        notifications.filter((n) => !n.read).forEach((n) => markAsRead(n.id));
                      }}
                      className="bg-white p-0 mb-2 text-xs text-accent hover:underline cursor-pointer"
                    >
                      {dict.common.markAllRead}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <div
            className={`flex items-center ${isAuthenticated ? "ps-2" : "p-2.5"} border border-dark rounded-full ml-2 gap-3 cursor-pointer hover:shadow-xl transition`}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <SlArrowDown
              size={20}
              className={`transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
            />
            {!isAuthenticated ? (
              <CiUser size={24} />
            ) : (
              <div className="bg-accent text-light rounded-full w-12 h-12 flex items-center justify-center font-semibold overflow-hidden relative shrink-0">
                {isGuide && guide?.medias?.[0]?.url ? (
                  <Image
                    src={MinioHelpers.guideProfile(guide.id, guide.medias[0].url)}
                    alt={`${session?.user?.first_name} ${session?.user?.last_name}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <p>
                    {session?.user?.first_name?.charAt(0).toUpperCase()}
                    {session?.user?.last_name?.charAt(0).toUpperCase()}
                  </p>
                )}
              </div>
            )}
          </div>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 bg-light border border-gray-light rounded-xl shadow-xl p-2 min-w-120 z-50">
              {!isAuthenticated ? (
                <>
                  <Link href={localizedPath(AUTH_ROUTES.LOGIN)} className="block w-full text-left p-3 hover:bg-gray-light rounded-lg" onClick={() => setIsUserMenuOpen(false)}>
                    {dict.auth.login}
                  </Link>
                  <Link href={localizedPath(AUTH_ROUTES.REGISTER)} className="block w-full text-left p-3 hover:bg-gray-light rounded-lg" onClick={() => setIsUserMenuOpen(false)}>
                    {dict.auth.register}
                  </Link>
                </>
              ) : (
                <>
                  <p className="font-semibold px-3 py-2">{dict.navigation.myAccount}</p>
                  <Link href={localizedPath(USER_ROUTES.PROFILE)} onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 p-3 duration-300 hover:bg-gray-light rounded-lg">
                    <div className="bg-accent text-light rounded-full w-10 h-10 flex items-center justify-center font-semibold overflow-hidden relative shrink-0">
                      {isGuide && guide?.medias?.[0]?.url ? (
                        <Image src={MinioHelpers.guideProfile(guide.id, guide.medias[0].url)} alt={`${session?.user?.first_name} ${session?.user?.last_name}`} fill className="object-cover" />
                      ) : (
                        <p>
                          {session?.user?.first_name?.charAt(0).toUpperCase()}
                          {session?.user?.last_name?.charAt(0).toUpperCase()}
                        </p>
                      )}
                    </div>
                    <div>
                      <p>
                        {session?.user?.first_name?.charAt(0).toUpperCase() + session?.user?.first_name?.slice(1)}{" "}
                        {session?.user?.last_name?.charAt(0).toUpperCase()}.
                      </p>
                      <p className="text-sm text-gray">{session?.user?.role}</p>
                    </div>
                  </Link>
                  <hr className="my-2 border-gray-light" />
                  <Link href={localizedPath(BOOKINGS_ROUTES.MY_BOOKINGS)} className="flex items-center gap-2 w-full text-left p-3 hover:bg-gray-light rounded-lg" onClick={() => setIsUserMenuOpen(false)}>
                    <LuTicket className="w-6 h-6 stroke-2" /> {dict.navigation.myBookings}
                  </Link>
                  <Link href={localizedPath(USER_ROUTES.PROFILE)} className="flex items-center gap-2 w-full text-left p-3 hover:bg-gray-light rounded-lg" onClick={() => setIsUserMenuOpen(false)}>
                    <CiUser className="w-6 h-6 stroke-1" /> {dict.navigation.profileManagement}
                  </Link>
                  <hr className="my-2 border-gray-light" />
                  <Link href={localizedPath(SUPPORT_ROUTES.FAQ)} className="flex items-center gap-2 w-full text-left p-3 hover:bg-gray-light rounded-lg" onClick={() => setIsUserMenuOpen(false)}>
                    <TfiHelpAlt className="w-6 h-6 stroke-0.5" /> {dict.navigation.support}
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left p-3 mt-2 bg-gray-200 hover:bg-gray-light rounded-lg duration-300 cursor-pointer">
                    {dict.auth.logout}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile right section */}
      <div className="flex md:hidden items-center gap-1">
        {isAuthenticated && (
          <Link href={localizedPath(HOME_ROUTES.MESSAGES)} className="nav-item">
            <LuMessageCircleMore size={22} />
          </Link>
        )}
        {isAuthenticated && (
          <div className="relative" ref={notificationsRef}>
            <button
              className="nav-item relative bg-light"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <IoNotificationsOutline size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute top-10 right-0 mt-2 bg-white border border-gray-light rounded-xl shadow-xl w-[calc(100vw-2rem)] max-w-sm z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-light bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gray-800">{dict.common.notifications}</h3>
                  {unreadCount > 0 && (
                    <span className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full font-semibold">
                      {unreadCount} {unreadCount > 1 ? dict.common.newPlural : dict.common.newSingular}
                    </span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {!notifications || notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">{dict.common.noNotifications}</div>
                  ) : (
                    notifications.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()).map((notif) => (
                      <div key={notif.id} onClick={() => handleNotificationClick(notif.id, notif.read)}
                        className={`p-3 border-b border-gray-light last:border-0 hover:bg-gray-50 cursor-pointer flex flex-col gap-0.5 ${notif.read ? "opacity-70" : "bg-accent/5 font-semibold"}`}
                      >
                        <p className={`text-xs ${notif.read ? "text-gray-700" : "text-gray-900"}`}>{notif.content}</p>
                        <span className="text-xs text-gray-400">{dayjs(notif.sent_at).fromNow()}</span>
                      </div>
                    ))
                  )}
                </div>
                {notifications && notifications.length > 0 && (
                  <div className="p-2 border-t border-gray-light bg-gray-50 text-center">
                    <button onClick={() => notifications.filter((n) => !n.read).forEach((n) => markAsRead(n.id))}
                      className="bg-white p-0 mb-1 text-xs text-accent hover:underline cursor-pointer">
                      {dict.common.markAllRead}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* User menu on mobile */}
        <div className="relative" ref={userMenuRef}>
          <div
            className={`flex items-center ${isAuthenticated ? "ps-1.5" : "p-2"} border border-dark rounded-full ml-1 gap-2 cursor-pointer hover:shadow-xl transition`}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <SlArrowDown size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
            {!isAuthenticated ? (
              <CiUser size={20} />
            ) : (
              <div className="bg-accent text-light rounded-full w-9 h-9 flex items-center justify-center font-semibold overflow-hidden relative shrink-0 text-sm">
                {isGuide && guide?.medias?.[0]?.url ? (
                  <Image src={MinioHelpers.guideProfile(guide.id, guide.medias[0].url)} alt={`${session?.user?.first_name} ${session?.user?.last_name}`} fill className="object-cover" />
                ) : (
                  <p>{session?.user?.first_name?.charAt(0).toUpperCase()}{session?.user?.last_name?.charAt(0).toUpperCase()}</p>
                )}
              </div>
            )}
          </div>
          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 bg-light border border-gray-light rounded-xl shadow-xl p-2 min-w-70 z-50">
              {!isAuthenticated ? (
                <>
                  <Link href={localizedPath(AUTH_ROUTES.LOGIN)} className="block w-full text-left p-3 hover:bg-gray-light rounded-lg" onClick={() => setIsUserMenuOpen(false)}>{dict.auth.login}</Link>
                  <Link href={localizedPath(AUTH_ROUTES.REGISTER)} className="block w-full text-left p-3 hover:bg-gray-light rounded-lg" onClick={() => setIsUserMenuOpen(false)}>{dict.auth.register}</Link>
                </>
              ) : (
                <>
                  <p className="font-semibold px-3 py-2 text-sm">{dict.navigation.myAccount}</p>
                  <Link href={localizedPath(BOOKINGS_ROUTES.MY_BOOKINGS)} className="flex items-center gap-2 w-full text-left p-3 hover:bg-gray-light rounded-lg text-sm" onClick={() => setIsUserMenuOpen(false)}>
                    <LuTicket className="w-5 h-5 stroke-2" /> {dict.navigation.myBookings}
                  </Link>
                  <Link href={localizedPath(USER_ROUTES.PROFILE)} className="flex items-center gap-2 w-full text-left p-3 hover:bg-gray-light rounded-lg text-sm" onClick={() => setIsUserMenuOpen(false)}>
                    <CiUser className="w-5 h-5 stroke-1" /> {dict.navigation.profileManagement}
                  </Link>
                  <hr className="my-1 border-gray-light" />
                  <button onClick={handleLogout} className="w-full text-left p-3 bg-gray-200 hover:bg-gray-light rounded-lg duration-300 cursor-pointer text-sm">
                    {dict.auth.logout}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Hamburger toggle */}
        <button
          className="nav-item ml-1 cursor-pointer bg-light"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={dict.common.menu}
        >
          {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-light shadow-lg border-t border-gray-light z-40 md:hidden">
          <div className="p-4 flex flex-col gap-1">
            <Link href={localizedPath(HOME_ROUTES.HOME)} className="p-3 hover:bg-gray-light rounded-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              {dict.navigation.home}
            </Link>
            <Link href={localizedPath(GUIDES_ROUTES.BECOME_GUIDE)} className="p-3 hover:bg-gray-light rounded-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              {dict.navigation.becomeGuide}
            </Link>
            <Link href={localizedPath(HOME_ROUTES.HELP)} className="p-3 hover:bg-gray-light rounded-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              {dict.navigation.helpCenter}
            </Link>
            <hr className="my-2 border-gray-light" />
            <p className="px-3 py-1 text-sm font-semibold text-dark/50 uppercase tracking-wide">{dict.navigation.language}</p>
            <div className="grid grid-cols-2 gap-2 px-3">
              {[
                { code: "fr", label: dict.navigation.french, flag: "/assets/flags/france.png", alt: "Français" },
                { code: "en", label: dict.navigation.english, flag: "/assets/flags/royaume-uni.png", alt: "English" },
                { code: "sp", label: dict.navigation.spanish, flag: "/assets/flags/espagne.png", alt: "Spanish" },
                { code: "de", label: dict.navigation.german, flag: "/assets/flags/allemagne.png", alt: "German" },
              ].map(({ code, label, flag, alt }) => (
                <button key={code} onClick={() => { changeLanguage(code); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 p-2 hover:bg-gray-light rounded-lg bg-white text-sm cursor-pointer border border-gray-light">
                  <Image src={flag} alt={alt} width={20} height={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}