'use client';

import { useEffect, useState } from 'react';
import { fetchProductsauto } from '@/services/categoryService';
import { getCurrentUserId } from '@/services/usservicecat';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTheme } from '@/contexts/ThemeContext';

// Interfaccia per i dati utente
interface User {
    fullName: string;
    city: string;
}

// Interfaccia per i prodotti
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    sold: boolean;
    user?: User;
}

export default function GiocattoliPage() {
    const { theme } = useTheme();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Carica i prodotti da localStorage, se presenti;
     * altrimenti fa la fetch da Firestore e salva in localStorage.
     */
    const loadProducts = async () => {
        setIsLoading(true);
        try {
            // 1. Verifica se esistono dati in cache per la categoria "Auto e Moto"
            const storedProducts = localStorage.getItem('giocattoliProducts');
            if (storedProducts) {
                // Se esistono in localStorage, li parsiamo e li impostiamo nello stato
                const parsedProducts: Product[] = JSON.parse(storedProducts);
                setProducts(parsedProducts);
                setIsLoading(false);
                return; // Interrompiamo qui: non serve fare la fetch
            }

            // 2. Se non ci sono dati in cache, procediamo con la fetch dal server
            const userId = getCurrentUserId();
            // Pass userId even if it's null - the service will handle it
            const fetchedProducts = (await fetchProductsauto(userId)) as Product[];
            // Salviamo in localStorage per evitare future fetch
            localStorage.setItem('giocattoliProducts', JSON.stringify(fetchedProducts));
            setProducts(fetchedProducts);
        } catch (error) {
            console.error('Errore durante il caricamento dei prodotti:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Eseguiamo loadProducts solo la prima volta (o quando ricarica la pagina)
     */
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
                    <h1 className="text-4xl font-extrabold mb-4">Auto e Moto</h1>
                    <p className="text-lg">Scopri i migliori articoli di auto e moto disponibili</p>
                </div>
            </section>

            <section className="container mx-auto py-12 px-6">
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
                    Esplora la categoria Auto e Moto
                </h2>
                {products.length === 0 ? (
                    <p className="text-center text-gray-500">
                        Nessun prodotto trovato nella categoria Auto e Moto
                    </p>
                ) : (
                    <div className="space-y-6">
                        {products.map((product) => (
                            <Link
                                href={`/Viewcategoryproduct/products/${product.id}`}
                                key={product.id}
                                className="block bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="flex items-center">
                                    <div className="w-1/3 flex items-center justify-center h-48 bg-gray-100 rounded-l-xl">
                                        <img
                                            src={product.image || '/images/placeholder.jpg'}
                                            alt={product.name}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                    <div className="w-2/3 p-6 flex flex-col space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {product.description}
                                        </p>
                                        <p className="text-lg font-semibold text-teal-600">
                                            € {product.price}
                                        </p>

                                        {/* Badge "Venduto" */}
                                        {product.sold && (
                                            <p className="text-sm font-semibold text-red-500 uppercase">
                                                Venduto
                                            </p>
                                        )}

                                        {/* Info venditore */}
                                        {product.user && (
                                            <p className="text-sm text-gray-500">
                                                Venduto da: {product.user.fullName} ({product.user.city})
                                            </p>
                                        )}
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