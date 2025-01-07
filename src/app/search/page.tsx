'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/data/firebase';
import Link from 'next/link';
import Header from '@/components/Header'; // Importa Header
import Footer from '@/components/Footer'; // Importa Footer

interface Product {
    id: string;
    name: string;
    description: string;
    price?: number;
    image?: string; // Aggiunto per gestire l'immagine del prodotto
}

export default function SearchResults() {
    return (
        <>
            <Header />
            {/* Aggiunta del Suspense boundary */}
            <Suspense fallback={<LoadingFallback />}>
                <SearchResultsContent />
            </Suspense>
            <Footer />
        </>
    );
}

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const searchQuery = searchParams.get('query') || '';

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery) return;

            setIsLoading(true);
            const q = query(
                collection(db, 'products'),
                where('name', '>=', searchQuery),
                where('name', '<=', searchQuery + '\uf8ff')
            );

            try {
                const querySnapshot = await getDocs(q);
                const results: Product[] = [];
                querySnapshot.forEach((doc) => {
                    results.push({ id: doc.id, ...doc.data() } as Product);
                });
                setSearchResults(results);
            } catch (error) {
                console.error('Errore durante la ricerca:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                    Risultati per: <span className="text-teal-600">&#34;{searchQuery}&#34;</span>
                </h1>

                {isLoading ? (
                    <div className="text-center text-lg font-medium text-gray-500">
                        Caricamento risultati...
                    </div>
                ) : searchResults.length > 0 ? (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map((product) => (
                            <li
                                key={product.id}
                                className="bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden transform transition-all hover:-translate-y-1"
                            >
                                <Link href={`/products/${product.id}`} className="block">
                                    <div className="p-4">
                                        {/* Aggiunta immagine prodotto */}
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-48 object-cover rounded-t-lg"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                                                Nessuna immagine
                                            </div>
                                        )}
                                        <h3 className="text-xl font-bold text-gray-800 mt-4">{product.name}</h3>
                                        <p className="text-gray-600 line-clamp-2">{product.description}</p>
                                        <p className="text-green-600 font-bold">€{product.price}</p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 text-lg">
                        Nessun prodotto trovato per{' '}
                        <span className="font-semibold">&#34;{searchQuery}&#34;</span>.
                    </p>
                )}
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-gray-500 text-lg font-medium">Caricamento in corso...</p>
        </div>
    );
}