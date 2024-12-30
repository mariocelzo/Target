import Link from 'next/link';

const Header = () => {
    return (
        <header className="w-full bg-[#C4333B] text-white p-4 shadow-md">
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo on the left */}
                <img
                    src="/logoNosfondo.png" // Inserisci qui il Base64 del logo
                    alt="Logo"
                    className="h-10 w-auto" // Adatta altezza e larghezza
                />

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