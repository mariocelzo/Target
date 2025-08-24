'use client';

import { useEffect, useState } from 'react';
import { fetchProductsele } from '@/services/categoryService';
import { getCurrentUserId } from '@/services/usservicecat';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTheme } from '@/contexts/ThemeContext';

// Interfaccia per l'utente
interface User {
    fullName: string;
    city: string;
}

// Interfaccia per il prodotto
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    sold: boolean;
    user?: User;
}

export default function ElectronicsPage() {
    const { theme } = useTheme();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            // Verifica la presenza di dati nel localStorage per la categoria Elettronica
            const storedProducts = localStorage.getItem('elettronicaProducts');
            if (storedProducts) {
                const parsedProducts: Product[] = JSON.parse(storedProducts);
                setProducts(parsedProducts);
                setIsLoading(false);
                return; // Se i dati sono disponibili in cache, evita una nuova fetch
            }

            const userId = getCurrentUserId();
            // Pass userId even if it's null - the service will handle it
            const fetchedProducts = await fetchProductsele(userId) as Product[];
            setProducts(fetchedProducts);
            // Salva i prodotti recuperati nel localStorage
            localStorage.setItem('elettronicaProducts', JSON.stringify(fetchedProducts));
        } catch (error) {
            console.error('Errore durante il caricamento dei prodotti:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    if (isLoading) {
        return (
            <div className={`flex items-center justify-center min-h-screen transition-colors duration-300 ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}>
            <Header />
            <section className={`text-white py-12 transition-colors duration-300 ${
                theme === 'dark' 
                    ? 'bg-gradient-to-r from-gray-800 to-gray-700' 
                    : 'bg-gradient-to-r from-teal-600 to-teal-400'
            }`}>
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl font-extrabold mb-4">Prodotti Elettronica</h1>
                    <p className="text-lg">Scopri i migliori articoli di elettronica disponibili</p>
                </div>
            </section>

            <section className="container mx-auto py-12 px-6">
                <h2 className={`text-3xl font-bold mb-8 text-center transition-colors duration-300 ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}>Esplora i Prodotti</h2>
                {products.length === 0 ? (
                    <p className={`text-center transition-colors duration-300 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                        Nessun prodotto trovato nella categoria Elettronica.
                    </p>
                ) : (
                    <div className="space-y-6">
                        {products.map((product) => (
                            <Link
                                href={`/Viewcategoryproduct/products/${product.id}`}
                                key={product.id}
                                className={`block border rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${
                                    theme === 'dark' 
                                        ? 'bg-gray-800 border-gray-600 hover:shadow-gray-900/50' 
                                        : 'bg-white border-gray-200'
                                }`}
                            >
                                <div className="flex items-center">
                                    <div className={`w-1/3 flex items-center justify-center h-48 rounded-l-xl transition-colors duration-300 ${
                                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                    }`}>
                                        <img
                                            src={product.image || '/images/placeholder.jpg'}
                                            alt={product.name}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                    <div className="w-2/3 p-6">
                                        <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                                            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                                        }`}>{product.name}</h3>
                                        <p className={`text-sm mb-3 transition-colors duration-300 ${
                                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                        }`}>{product.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-[#C4333B] dark:text-red-400">{product.price} €</span>
                                            {product.user && (
                                                <div className="text-right">
                                                    <p className={`text-sm font-medium transition-colors duration-300 ${
                                                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                                    }`}>{product.user.fullName}</p>
                                                    <p className={`text-xs transition-colors duration-300 ${
                                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>{product.user.city}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
}