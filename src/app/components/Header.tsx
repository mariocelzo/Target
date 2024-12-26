import Link from 'next/link';

const Header = () => {
    return (
        <header className="bg-[#C4333B] text-white p-4">
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo on the left */}
                <Link href="/" className="text-2xl font-bold">
                    Logo
                </Link>

                {/* Navigation links centered */}
                <nav className="flex-grow text-center">
                    <ul className="flex justify-center space-x-6">
                        <li><Link href="/" className="hover:underline">Home</Link></li>
                        <li><Link href="/sell" className="hover:underline">Vendi</Link></li>
                        <li><Link href="/categories" className="hover:underline">Categorie</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
