'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { User, Menu, MessageSquare } from 'lucide-react';
import { auth, db } from '@/data/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

/**
 * Header principale
 */
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Per aprire/chiudere il menu profilo
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Foto utente (se presente in Firestore)
    const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);

    // Path corrente (usato per evidenziare link attivo)
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    // Router se vuoi fare redirect dopo logout
    const router = useRouter();

    /**
     * Recupero foto profilo da Firestore
     */
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserPhotoUrl(userData.imageUrl || null);
                }
            } else {
                setUserPhotoUrl(null);
            }
        });

        return () => unsubscribe();
    }, []);

    /**
     * Esegui il logout da Firebase.
     */
    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUserPhotoUrl(null);
             router.push('/Autenticazione/login'); // Se vuoi reindirizzare al login
        } catch (error) {
            console.error('Errore durante il logout:', error);
        }
    };

    return (
        <header className="w-full bg-gradient-to-r from-[#C4333B] to-[#41978F] text-white py-4 shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <img
                            src="/logoNosfondo.png"
                            alt="Logo"
                            className="h-12 w-auto"
                        />
                    </Link>

                    {/* NAV Desktop (senza Chat) */}
                    <nav className="hidden md:flex space-x-6 text-lg font-medium items-center">
                        <NavLink href="/" isActive={isActive('/')}>
                            Home
                        </NavLink>
                        <NavLink href="/Sellpackage/sell" isActive={isActive('/sell')}>
                            Vendi
                        </NavLink>

                        {/* Dropdown Categorie */}
                        <div className="relative group">
                            <button className="flex items-center hover:text-gray-200 transition-colors duration-200">
                                Categorie
                                <svg
                                    className="ml-1 h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>
                            <div className="absolute left-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="py-1">
                                    <CategoryLink href="/Viewcategoryproduct/categories/Elettronica">Elettronica</CategoryLink>
                                    <CategoryLink href="/Viewcategoryproduct/categories/Arredamento">Arredamento</CategoryLink>
                                    <CategoryLink href="/Viewcategoryproduct/categories/Moda">Moda</CategoryLink>
                                    <CategoryLink href="/Viewcategoryproduct/categories/Giocattoli">Auto e Moto</CategoryLink>
                                </div>
                            </div>
                        </div>

                        <NavLink href="/Team/about" isActive={isActive('/about')}>
                            Chi Siamo
                        </NavLink>
                    </nav>

                    {/* Icons + Mobile Menu Button */}
                    <div className="flex items-center space-x-4">
                        {/* Icona Chat vicino all'utente */}
                        <NavLinkIcon
                            href="/Messages/chat/${user.uid}"
                            isActive={isActive('/Messages/chat/[id]/page')}
                        >
                            <MessageSquare size={22} />
                        </NavLinkIcon>

                        {/* Contenitore icona/foto profilo + menu a tendina */}
                        <div className="relative">
                            {/* Foto utente o icona di default */}
                            <button
                                className="hover:text-gray-200 transition-colors duration-200 flex items-center justify-center"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                                {userPhotoUrl ? (
                                    <Image
                                        src={userPhotoUrl}
                                        alt="Profile"
                                        width={32}
                                        height={32}
                                        className="rounded-full border-2 border-white"
                                    />
                                ) : (
                                    <User size={24} />
                                )}
                            </button>

                            {/* Menu a tendina del profilo */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-md shadow-lg z-50">
                                    <div className="flex flex-col py-2">
                                        <Link
                                            href="/Autenticazione/user-area"
                                            className="px-4 py-2 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Profilo
                                        </Link>
                                        <button
                                            className="text-left px-4 py-2 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                handleLogout();
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pulsante Mobile */}
                        <button
                            className="md:hidden focus:outline-none"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>

                {/* NAV Mobile */}
                <div
                    className={`
            md:hidden 
            bg-[#2C6E68] bg-opacity-90
            rounded-b
            shadow-lg
            mt-2
            overflow-hidden
            transform transition-all duration-300 
            ${isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}
          `}
                    style={{ willChange: 'transform' }}
                >
                    {isMenuOpen && (
                        <nav className="p-4 flex flex-col space-y-3 text-white">
                            <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>
                                Home
                            </MobileNavLink>
                            <MobileNavLink href="/Sellpackage/sell" onClick={() => setIsMenuOpen(false)}>
                                Vendi
                            </MobileNavLink>
                            <MobileNavLink href="/categories" onClick={() => setIsMenuOpen(false)}>
                                Categorie
                            </MobileNavLink>
                            <MobileNavLink href="/about" onClick={() => setIsMenuOpen(false)}>
                                Chi Siamo
                            </MobileNavLink>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

/**
 * Link testuale con "attivo se pathname matcha"
 * L'active color è "text-teal-300"
 */
const NavLink = ({
                     href,
                     children,
                     isActive,
                 }: {
    href: string;
    children: React.ReactNode;
    isActive: boolean;
}) => (
    <Link
        href={href}
        className={`transition-colors duration-200 hover:text-gray-200 ${
            isActive ? 'text-teal-300' : ''
        }`}
    >
        {children}
    </Link>
);

/**
 * Link icona (stesso meccanismo dell'active color)
 */
const NavLinkIcon = ({
                         href,
                         children,
                         isActive,
                     }: {
    href: string;
    children: React.ReactNode;
    isActive: boolean;
}) => (
    <Link
        href={href}
        className={`transition-colors duration-200 hover:text-gray-200 flex items-center ${
            isActive ? 'text-teal-300' : ''
        }`}
    >
        {children}
    </Link>
);

/**
 * Categorie
 */
const CategoryLink = ({
                          href,
                          children,
                      }: {
    href: string;
    children: React.ReactNode;
}) => (
    <Link
        href={href}
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    >
        {children}
    </Link>
);

/**
 * Link Mobile
 */
const MobileNavLink = ({
                           href,
                           children,
                           onClick,
                       }: {
    href: string;
    children: React.ReactNode;
    onClick: () => void;
}) => (
    <Link
        href={href}
        onClick={onClick}
        className="block py-2 px-4 hover:bg-white hover:bg-opacity-10 rounded transition-colors duration-200"
    >
        {children}
    </Link>
);