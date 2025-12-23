'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from "next/image";
import Link from "next/link";
import { MdLanguage } from "react-icons/md";
import { TfiHelpAlt } from "react-icons/tfi";
import { CiUser } from "react-icons/ci";
import { SlArrowDown } from "react-icons/sl";
import { LuMessageCircleMore, LuTicket } from "react-icons/lu";
import { IoNotificationsOutline } from "react-icons/io5";
import { AUTH_ROUTES, HOME_ROUTES, BOOKINGS_ROUTES, USER_ROUTES, SUPPORT_ROUTES } from '@/utils/routes';
import { useTranslations, useLocalizedPath } from '@/providers/i18n.provider';

export default function Header() {
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";
    const dict = useTranslations();
    const localizedPath = useLocalizedPath();
    
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const langMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
            if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
                setIsLangMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await signOut({ callbackUrl: localizedPath('/') });
    };

    return (
        <header className="w-full p-4 flex justify-between items-center sticky top-0 bg-light shadow-md z-50">
            <Link href={localizedPath(HOME_ROUTES.HOME)}>
                <Image 
                    src="/assets/logo_locotrip.png" 
                    alt="Locotrip Logo" 
                    width={200}
                    height={40}
                    priority
                />
            </Link>
            <nav className="flex items-center gap-2">
                {/* Menu Langue */}
                <div className="relative" ref={langMenuRef}>
                    <div 
                        className="nav-item cursor-pointer"
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    >
                        <MdLanguage size={24} />
                    </div>
                    
                    {/* Dropdown Langue */}
                    {isLangMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 bg-light border border-gray-light rounded-xl shadow-xl p-2 min-w-37.5 z-50">
                            <button className="w-full text-left p-2 hover:bg-gray-light rounded-lg">
                                {dict.navigation.french}
                            </button>
                            <button className="w-full text-left p-2 hover:bg-gray-light rounded-lg">
                                {dict.navigation.english}
                            </button>
                            <button className="w-full text-left p-2 hover:bg-gray-light rounded-lg">
                                {dict.navigation.spanish}
                            </button>
                            <button className="w-full text-left p-2 hover:bg-gray-light rounded-lg">
                                {dict.navigation.german}
                            </button>
                        </div>
                    )}
                </div>

                {/* Menu Aide */}
                {!isAuthenticated && (
                    <div className="nav-item">
                        <Link href={localizedPath(SUPPORT_ROUTES.FAQ)}>
                            <TfiHelpAlt size={24} />
                        </Link>
                    </div>
                )}

                {/* Menu Message (Connecté seulement) */}
                {isAuthenticated && (
                    <div className="nav-item">
                        <Link href={localizedPath(HOME_ROUTES.MESSAGES)}>
                            <LuMessageCircleMore size={24} />
                        </Link>
                    </div>
                )}

                {/* Menu Notifications (Connecté seulement) */}
                {isAuthenticated && (
                    <div className="nav-item">
                        <Link href={localizedPath(HOME_ROUTES.NOTIFICATIONS)}>
                            <IoNotificationsOutline size={24} />
                        </Link>
                    </div>
                )}

                {/* Menu Utilisateur */}
                <div className="relative" ref={userMenuRef}>
                    <div 
                        className={`flex items-center ${isAuthenticated ? 'ps-2' : 'p-2.5'} border border-dark rounded-full ml-2 gap-3 cursor-pointer hover:shadow-xl transition`}
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                        <SlArrowDown 
                            size={20} 
                            className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                        />
                        {!isAuthenticated ? (
                            <CiUser size={24} />
                        ) : (
                            <div className="bg-accent text-light rounded-full p-2.5 flex items-center font-semibold">
                                <p>
                                    {session?.user?.first_name?.charAt(0).toUpperCase()}
                                    {session?.user?.last_name?.charAt(0).toUpperCase()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Dropdown Utilisateur */}
                    {isUserMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 bg-light border border-gray-light rounded-xl shadow-xl p-2 min-w-50 z-50">
                            {!isAuthenticated ? (
                                // Menu non connecté
                                <>
                                    <Link 
                                        href={localizedPath(AUTH_ROUTES.LOGIN)} 
                                        className="block w-full text-left p-3 hover:bg-gray-light rounded-lg"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        {dict.auth.login}
                                    </Link>
                                    <Link 
                                        href={localizedPath(AUTH_ROUTES.REGISTER)} 
                                        className="block w-full text-left p-3 hover:bg-gray-light rounded-lg"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        {dict.auth.register}
                                    </Link>
                                </>
                            ) : (
                                // Menu connecté
                                <>
                                    <p className="font-semibold px-3 py-2">{dict.navigation.myAccount || 'Mon compte'}</p>
                                    <div className="flex items-center gap-2 p-2">
                                        <div className="bg-accent text-light rounded-full p-3 flex items-center font-semibold">
                                            <p>
                                                {session?.user?.first_name?.charAt(0).toUpperCase()}
                                                {session?.user?.last_name?.charAt(0).toUpperCase()}
                                            </p>
                                        </div>
                                        <Link 
                                            href={localizedPath(USER_ROUTES.PROFILE)} 
                                            className="block w-full text-left p-3 hover:bg-gray-light rounded-lg"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            {session?.user?.first_name?.charAt(0).toUpperCase() + session?.user?.first_name?.slice(1)} {session?.user?.last_name?.charAt(0).toUpperCase()}.
                                        </Link>
                                    </div>
                                    <hr className="my-2 border-gray-light" />
                                    <Link 
                                        href={localizedPath(BOOKINGS_ROUTES.MY_BOOKINGS)} 
                                        className="flex items-center gap-2 w-full text-left p-3 hover:bg-gray-light rounded-lg"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <LuTicket /> {dict.navigation.myBookings || 'Mes réservations'}
                                    </Link>
                                    <Link 
                                        href={localizedPath(USER_ROUTES.PROFILE)} 
                                        className="flex items-center gap-2 w-full text-left p-3 hover:bg-gray-light rounded-lg"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <CiUser /> {dict.navigation.profileManagement || 'Gestion du profil'}
                                    </Link>
                                    <hr className="my-2 border-gray-light" />
                                    <Link 
                                        href={localizedPath(SUPPORT_ROUTES.FAQ)} 
                                        className="flex items-center gap-2 w-full text-left p-3 hover:bg-gray-light rounded-lg"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <TfiHelpAlt /> {dict.navigation.support || 'Support / Aide'}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left p-3 hover:bg-gray-light rounded-lg text-error"
                                    >
                                        {dict.auth.logout}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </header>
    )
}