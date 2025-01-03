'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { User, Menu } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

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

    return (
        <header className="w-full bg-gradient-to-r from-[#C4333B] to-[#8B0000] text-white py-4 shadow-lg">
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

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-6 text-lg">
                        <NavLink href="/" isActive={isActive('/')}>Home</NavLink>
                        <NavLink href="/sell" isActive={isActive('/sell')}>Vendi</NavLink>
                        <div className="relative group">
                            <button className="flex items-center hover:text-teal-300 transition-colors duration-200">
                                Categorie
                                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="py-1">
                                    <CategoryLink href="/categories/Elettronica">Elettronica</CategoryLink>
                                    <CategoryLink href="/categories/Arredamento">Arredamento</CategoryLink>
                                    <CategoryLink href="/categories/Moda">Moda</CategoryLink>
                                    <CategoryLink href="/categories/Auto-e-Moto">Auto e Moto</CategoryLink>
                                </div>
                            </div>
                        </div>
                        <NavLink href="/about" isActive={isActive('/about')}>Chi Siamo</NavLink>
                    </nav>

                    {/* User Profile */}
                    <div className="flex items-center">
                        <Link href="/profile" className="hover:text-teal-300 transition-colors duration-200">
                            {userPhotoUrl ? (
                                <Image
                                    src={userPhotoUrl}
                                    alt="Profile"
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                            ) : (
                                <User size={24} />
                            )}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden focus:outline-none"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu size={24} />
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="mt-4 md:hidden">
                        <div className="flex flex-col space-y-2">
                            <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
                            <MobileNavLink href="/sell" onClick={() => setIsMenuOpen(false)}>Vendi</MobileNavLink>
                            <MobileNavLink href="/categories" onClick={() => setIsMenuOpen(false)}>Categorie</MobileNavLink>
                            <MobileNavLink href="/about" onClick={() => setIsMenuOpen(false)}>Chi Siamo</MobileNavLink>
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
};

const NavLink = ({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) => (
    <Link href={href} className={`hover:text-teal-300 transition-colors duration-200 ${isActive ? 'text-teal-300 font-semibold' : ''}`}>
        {children}
    </Link>
);

const CategoryLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
        {children}
    </Link>
);

const MobileNavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) => (
    <Link href={href} className="block py-2 hover:bg-white hover:bg-opacity-10 px-4 rounded transition-colors duration-200" onClick={onClick}>
        {children}
    </Link>
);

export default Header;

