const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white p-4 mt-auto">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} Il tuo Marketplace. Tutti i diritti riservati.</p>
            </div>
        </footer>
    );
};

export default Footer;