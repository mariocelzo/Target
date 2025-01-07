'use client';

import { useEffect, useState } from 'react';
import { fetchProducts } from '@/services/categoryService';
import { getCurrentUserId } from '@/services/usservicecat';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner'; // Importa la rotella di caricamento

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
    image?: string; // Campo opzionale
    sold: boolean;
    user?: User; // Campo opzionale
}

export default function ElectronicsPage() {
    const [products, setProducts] = useState<Product[]>([]); // Rimosso any
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true); // Attiva il caricamento
            try {
                const userId = getCurrentUserId();
                if (userId) {
                    const products = await fetchProducts(userId) as Product[]; // Cast esplicito
                    setProducts(products);
                }
            } catch (error) {
                console.error('Errore durante il caricamento dei prodotti:', error);
            } finally {
                setIsLoading(false); // Disattiva il caricamento
            }
        };

        loadProducts();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <LoadingSpinner /> {/* Mostra la rotella di caricamento */}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <section className="bg-gradient-to-r from-teal-600 to-teal-400 text-white py-12">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl font-extrabold mb-4">Prodotti Arredamento</h1>
                    <p className="text-lg">Scopri i migliori articoli di arredamento disponibili</p>
                </div>
            </section>

            <section className="container mx-auto py-12 px-6">
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Esplora i Prodotti</h2>
                {products.length === 0 ? (
                    <p className="text-center text-gray-500">Nessun prodotto trovato nella categoria Arredamento.</p>
                ) : (
                    <div className="space-y-6">
                        {products.map((product) => (
                            <Link
                                href={`/products/${product.id}`}
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
                                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                                        <p className="text-lg font-semibold text-teal-600">€ {product.price}</p>
                                        {product.sold && (
                                            <p className="text-sm font-semibold text-red-500 uppercase">Venduto</p>
                                        )}
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