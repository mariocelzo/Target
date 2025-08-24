const Footer = () => {
    return (
        <footer className="bg-gray-900 dark:bg-gray-950 text-white w-full py-10 transition-colors duration-300">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Informazioni sul sito */}
                <div>
                    <h3 className="text-lg font-bold mb-4">Target Marketplace</h3>
                    <p className="text-sm text-gray-300 dark:text-gray-400">
                        La piattaforma per vendere e acquistare prodotti di seconda mano con facilità e sicurezza.
                    </p>
                </div>

                {/* Link utili */}
                <div>
                    <h3 className="text-lg font-bold mb-4">Link Utili</h3>
                    <ul className="space-y-2">
                        <li>
                            <a href="/Team/about" className="hover:underline text-gray-300 dark:text-gray-400 hover:text-white transition-colors duration-200">
                                Chi Siamo
                            </a>
                        </li>
                        <li>
                            <a href="/help" className="hover:underline text-gray-300 dark:text-gray-400 hover:text-white transition-colors duration-200">
                                Centro Assistenza
                            </a>
                        </li>
                        <li>
                            <a href="/privacy-policy" className="hover:underline text-gray-300 dark:text-gray-400 hover:text-white transition-colors duration-200">
                                Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a href="/terms-of-service" className="hover:underline text-gray-300 dark:text-gray-400 hover:text-white transition-colors duration-200">
                                Termini di Servizio
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Contatti */}
                <div>
                    <h3 className="text-lg font-bold mb-4">Contattaci</h3>
                    <ul className="space-y-2">
                        <li className="text-gray-300 dark:text-gray-400">Email: <a href="mailto:support@target.com" className="hover:underline hover:text-white transition-colors duration-200">support@target.com</a></li>
                        <li className="text-gray-300 dark:text-gray-400">Telefono: <a href="tel:+1234567890" className="hover:underline hover:text-white transition-colors duration-200">+123 456 7890</a></li>
                        <li>
                            <a href="/Team/contact" className="hover:underline text-gray-300 dark:text-gray-400 hover:text-white transition-colors duration-200">
                                Modulo di Contatto
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Social Media */}
                <div>
                    <h3 className="text-lg font-bold mb-4">Seguici</h3>
                    <div className="flex flex-col space-y-4">
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-transform flex items-center space-x-2 text-gray-300 dark:text-gray-400 hover:text-white"
                        >
                            <span>Facebook</span>
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-transform flex items-center space-x-2 text-gray-300 dark:text-gray-400 hover:text-white"
                        >
                            <span>Twitter</span>
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-transform flex items-center space-x-2 text-gray-300 dark:text-gray-400 hover:text-white"
                        >
                            <span>Instagram</span>
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-transform flex items-center space-x-2 text-gray-300 dark:text-gray-400 hover:text-white"
                        >
                            <span>LinkedIn</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-700 dark:border-gray-600 mt-8 pt-4 text-center text-sm">
                <p className="text-gray-300 dark:text-gray-400">&copy; {new Date().getFullYear()} Target Marketplace. Tutti i diritti riservati.</p>
                <p className="text-gray-400 dark:text-gray-500 mt-1">Progettato con ❤️ per il commercio sostenibile.</p>
            </div>
        </footer>
    );
};

export default Footer;