import Link from 'next/link';

const Header = () => {
    return (
        <header className="w-full bg-[#C4333B] text-white py-4 shadow-md">
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo a sinistra */}
                <Link href="/" className="text-3xl font-extrabold">
                    <img
                        src="/logoNosfondo.png" // Inserisci qui il Base64 del logo
                        alt="Logo"
                        className="h-10 w-auto" // Adatta altezza e larghezza
                    />
                </Link>

                {/* Navbar centrata */}
                <nav className="flex flex-1 justify-center space-x-6 text-lg">
                    <ul className="flex space-x-6">
                        <li>
                            <Link href="/" className="hover:text-teal-500 hover:scale-105 transition-all duration-200 ease-in-out">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/sell" className="hover:text-teal-500 hover:scale-105 transition-all duration-200 ease-in-out">
                                Vendi
                            </Link>
                        </li>
                        <li className="relative group">
                            {/* Link principale per "Categorie" */}
                            <button className="hover:text-teal-500 hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none">
                                Categorie
                            </button>

                            {/* Dropdown menu */}
                            <div className="absolute left-0 mt-2 hidden w-48 bg-white text-black shadow-lg rounded-lg group-hover:block">
                                <ul className="py-2">
                                    <li>
                                        <Link
                                            href="/categories/Elettronica"
                                            className="block px-4 py-2 hover:bg-gray-100"
                                        >
                                            Elettronica
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/categories/Arredamento"
                                            className="block px-4 py-2 hover:bg-gray-100"
                                        >
                                            Arredamento
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/categories/Moda"
                                            className="block px-4 py-2 hover:bg-gray-100"
                                        >
                                            Moda
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/categories/Giocattoli"
                                            className="block px-4 py-2 hover:bg-gray-100"
                                        >
                                            Auto e Moto
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li>
                            <Link href="/about" className="hover:text-teal-500 hover:scale-105 transition-all duration-200 ease-in-out">
                                Chi Siamo
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Icona utente e chat */}
                <div className="flex items-center space-x-4">
                    {/* Qui puoi aggiungere la logica per la sezione utente e chat */}


                </div>
            </div>
        </header>
    );
};

export default Header;