'use client'; // ✅ Nécessaire pour utiliser les hooks React

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react'; // ✅ Import NextAuth
import Image from "next/image";
import Link from "next/link";
import { MdLanguage } from "react-icons/md";
import { TfiHelpAlt } from "react-icons/tfi";
import { CiUser } from "react-icons/ci";
import { SlArrowDown } from "react-icons/sl";
import { LuMessageCircleMore, LuTicket } from "react-icons/lu";
import { IoNotificationsOutline } from "react-icons/io5";

export default function Header() {
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";
    
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
        await signOut({ callbackUrl: '/' });
    };

    return (
        <header className="w-full p-4 flex justify-between items-center">
            <Link href="/">
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
                        <div className="absolute top-full right-0 mt-2 bg-light border border-gray-light rounded-xl shadow-xl p-2 min-w-[150px] z-50">
                            <button className="w-full text-left p-2 hover:bg-gray-light rounded-lg">
                                Français
                            </button>
                            <button className="w-full text-left p-2 hover:bg-gray-light rounded-lg">
                                English
                            </button>
                            <button className="w-full text-left p-2 hover:bg-gray-light rounded-lg">
                                Español
                            </button>
                        </div>
                    )}
                </div>

                {/* Menu Aide */}
                {!isAuthenticated && (
                    <div className="nav-item">
                        <Link href="/help">
                            <TfiHelpAlt size={24} />
                        </Link>
                    </div>
                )}

                {/* Menu Message (Connecté seulement) */}
                {isAuthenticated && (
                    <div className="nav-item">
                        <Link href="/messages">
                            <LuMessageCircleMore size={24} />
                        </Link>
                    </div>
                )}

                {/* Menu Notifications (Connecté seulement) */}
                {isAuthenticated && (
                    <div className="nav-item">
                        <Link href="/notifications">
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
                        <div className="absolute top-full right-0 mt-2 bg-light border border-gray-light rounded-xl shadow-xl p-2 min-w-[200px] z-50">
                            {!isAuthenticated ? (
                                // Menu non connecté
                                <>
                                    <Link 
                                        href="/login" 
                                        className="block w-full text-left p-3 hover:bg-gray-light rounded-lg"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        Se connecter
                                    </Link>
                                    <Link 
                                        href="/register" 
                                        className="block w-full text-left p-3 hover:bg-gray-light rounded-lg"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        S'inscrire
                                    </Link>
                                </>
                            ) : (
                                // Menu connecté
                                <>
                                    <p>Mon compte</p>
                                    <div className="flex items-center gap-2 p-2">
                                        <div className="bg-accent text-light rounded-full p-3 flex items-center font-semibold">
                                            <p>
                                                {session?.user?.first_name?.charAt(0).toUpperCase()}
                                                {session?.user?.last_name?.charAt(0).toUpperCase()}
                                            </p>
                                        </div>
                                        <Link 
                                            href="/profile" 
                                            className="block w-full text-left p-3 hover:bg-gray-light rounded-lg"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            {session?.user?.first_name?.charAt(0).toUpperCase() + session?.user?.first_name?.slice(1)} {session?.user?.last_name?.charAt(0).toUpperCase()}.
                                        </Link>
                                    </div>
                                    <hr className="my-2 border-gray-light" />
                                    <Link 
                                        href="/bookings" 
                                        className="block w-full text-left p-3 hover:bg-gray-light rounded-lg"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <LuTicket /> Mes réservations
                                    </Link>
                                    <Link 
                                        href="/profile" 
                                        className="block w-full text-left p-3 hover:bg-gray-light rounded-lg"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <CiUser /> Gestion du profil
                                    </Link>
                                    <hr className="my-2 border-gray-light" />
                                    <Link 
                                        href="/help" 
                                        className="block w-full text-left p-3 hover:bg-gray-light rounded-lg"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <TfiHelpAlt /> Support / Aide
                                    </Link>
                                    <Link 
                                        href="#"
                                        onClick={handleLogout}
                                        className="hover:bg-gray-light rounded-lg text-error"
                                    >
                                        Déconnexion
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </header>
    )
}