const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white w-full py-10">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Informazioni sul sito */}
                <div>
                    <h3 className="text-lg font-bold mb-4">Target Marketplace</h3>
                    <p className="text-sm">
                        La piattaforma per vendere e acquistare prodotti di seconda mano con facilità e sicurezza.
                    </p>
                </div>

                {/* Link utili */}
                <div>
                    <h3 className="text-lg font-bold mb-4">Link Utili</h3>
                    <ul className="space-y-2">
                        <li>
                            <a href="/Team/about" className="hover:underline">
                                Chi Siamo
                            </a>
                        </li>
                        <li>
                            <a href="/help" className="hover:underline">
                                Centro Assistenza
                            </a>
                        </li>
                        <li>
                            <a href="/privacy-policy" className="hover:underline">
                                Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a href="/terms-of-service" className="hover:underline">
                                Termini di Servizio
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Contatti */}
                <div>
                    <h3 className="text-lg font-bold mb-4">Contattaci</h3>
                    <ul className="space-y-2">
                        <li>Email: <a href="mailto:support@target.com" className="hover:underline">support@target.com</a></li>
                        <li>Telefono: <a href="tel:+1234567890" className="hover:underline">+123 456 7890</a></li>
                        <li>
                            <a href="/Team/contact" className="hover:underline">
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
                            className="hover:scale-110 transition-transform flex items-center space-x-2"
                        >

                            <span>Facebook</span>
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-transform flex items-center space-x-2"
                        >

                            <span>Twitter</span>
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-transform flex items-center space-x-2"
                        >

                            <span>Instagram</span>
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-transform flex items-center space-x-2"
                        >

                            <span>LinkedIn</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} Target Marketplace. Tutti i diritti riservati.</p>
                <p>
                    Progettato con ❤️ per il commercio sostenibile.
                </p>
            </div>
        </footer>
    );
};

export default Footer;