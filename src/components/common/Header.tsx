'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
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
import { useCurrencies } from '@/services/currencies/getCurrencies';

export default function Header() {
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";
    const dict = useTranslations();
    const localizedPath = useLocalizedPath();
    const { data: currencies, isLoading: currenciesLoading } = useCurrencies();
    const router = useRouter();
    const pathname = usePathname();
    
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const [langCurrencyTab, setLangCurrencyTab] = useState<'language' | 'currency'>('language');

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

    const changeLanguage = (newLocale: string) => {
        const segments = pathname.split('/');
        const currentLocale = segments[1];
        
        const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
        
        router.push(newPathname);
        setIsLangMenuOpen(false);
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
                {/* Menu Langue & Devise */}
                <div className="relative" ref={langMenuRef}>
                    <div 
                        className="nav-item cursor-pointer"
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    >
                        <MdLanguage size={24} />
                    </div>
                    
                    {/* Dropdown Langue & Devise */}
                    {isLangMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-light rounded-xl shadow-xl min-w-105 z-50">
                            {/* Onglets */}
                            <div className="flex border-b border-gray-light">
                                <button
                                    onClick={() => setLangCurrencyTab('language')}
                                    className={`flex-1 px-6 py-3 transition border-b-2 bg-white rounded-none rounded-tl-xl ${
                                        langCurrencyTab === 'language' 
                                            ? 'border-accent font-semibold' 
                                            : 'border-transparent hover:bg-gray-light/50'
                                    }`}
                                >
                                    
                                    {dict.navigation.language}
                                </button>
                                <button
                                    onClick={() => setLangCurrencyTab('currency')}
                                    className={`flex-1 px-6 py-3 transition border-b-2 bg-white rounded-none rounded-tr-xl ${
                                        langCurrencyTab === 'currency' 
                                            ? 'border-accent font-semibold' 
                                            : 'border-transparent hover:bg-gray-light/50'
                                    }`}
                                >
                                    {dict.navigation.currency}
                                </button>
                            </div>

                            {/* Contenu selon l'onglet */}
                            <div className="p-6">
                                {langCurrencyTab === 'language' ? (
                                    <>
                                        <h3 className="mb-6 font-bold text-2xl">
                                            {dict.common.language}
                                        </h3>
                                        <button 
                                            onClick={() => changeLanguage('fr')}
                                            className="w-full text-left p-3 hover:bg-gray-light rounded-lg bg-white cursor-pointer"
                                        >
                                            <Image 
                                                src="/assets/flags/france.png"
                                                alt="Français"
                                                width={24}
                                                height={16}
                                                className="inline-block mr-3"
                                            />
                                            {dict.navigation.french}
                                        </button>
                                        <button 
                                            onClick={() => changeLanguage('en')}
                                            className="w-full text-left p-3 hover:bg-gray-light rounded-lg bg-white cursor-pointer"
                                        >
                                            <Image 
                                                src="/assets/flags/royaume-uni.png"
                                                alt="English"
                                                width={24}
                                                height={16}
                                                className="inline-block mr-3"
                                            />
                                            {dict.navigation.english}
                                        </button>
                                        <button 
                                            onClick={() => changeLanguage('sp')}
                                            className="w-full text-left p-3 hover:bg-gray-light rounded-lg bg-white cursor-pointer"
                                        >
                                            <Image 
                                                src="/assets/flags/espagne.png"
                                                alt="Spanish"
                                                width={24}
                                                height={16}
                                                className="inline-block mr-3"
                                            />
                                            {dict.navigation.spanish}
                                        </button>
                                        <button 
                                            onClick={() => changeLanguage('de')}
                                            className="w-full text-left p-3 hover:bg-gray-light rounded-lg bg-white cursor-pointer"
                                        >
                                            <Image 
                                                src="/assets/flags/allemagne.png"
                                                alt="German"
                                                width={24}
                                                height={16}
                                                className="inline-block mr-3"
                                            />
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
                                                    <span className="font-semibold text-accent">{currency.code}</span> - {currency.name}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-gray">
                                                Aucune devise disponible
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Menu Aide */}
                {!isAuthenticated && (
                    <div className="nav-item">
                        <Link href={localizedPath(HOME_ROUTES.HELP)}>
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
                                    <Link href={localizedPath(USER_ROUTES.PROFILE)} onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 p-3 duration-300 hover:bg-gray-light rounded-lg">
                                        <div className="bg-accent text-light rounded-full w-10 h-10 flex items-center justify-center font-semibold shrink-0 ">
                                            <p>
                                                {session?.user?.first_name?.charAt(0).toUpperCase()}
                                                {session?.user?.last_name?.charAt(0).toUpperCase()}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <p>{session?.user?.first_name?.charAt(0).toUpperCase() + session?.user?.first_name?.slice(1)} {session?.user?.last_name?.charAt(0).toUpperCase()}.</p>
                                            <p className="text-sm text-gray">{session?.user?.email}</p>
                                        </div>
                                    </Link>
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