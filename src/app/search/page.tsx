'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // Cambia useRouter con useSearchParams
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;  // Cambia 'title' con 'name'
    description: string;
    price?: number;
}

export default function SearchResults() {
    return (
        <Suspense fallback={<div>Caricamento...</div>}>
            <SearchResultsContent />
        </Suspense>
    );
}

function SearchResultsContent() {
    const searchParams = useSearchParams(); // Ottieni i parametri di query
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Ottieni la query dall'URL
    const searchQuery = searchParams.get('query') || ''; // Fallback a stringa vuota

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery) return;

            setIsLoading(true);
            const q = query(
                collection(db, 'products'),
                where('name', '>=', searchQuery),
                where('name', '<=', searchQuery + '\uf8ff')  // Ricerca su 'name' (campo del prodotto)
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
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">
                    Risultati della ricerca per: &#34;{searchQuery}&#34;
                </h1>

                {isLoading ? (
                    <div className="text-center">Caricamento...</div>
                ) : searchResults.length > 0 ? (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map((product) => (
                            <li key={product.id} className="bg-white shadow-md rounded-lg p-4">
                                <Link href={`/products/${product.id}`}>
                                    <h3 className="text-xl font-bold">{product.name}</h3> {/* Cambia title con name */}
                                    <p className="text-gray-500">{product.description}</p>
                                    <p className="text-green-600 font-bold">€{product.price}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500">
                        Nessun prodotto trovato per &#34;{searchQuery}&#34;.
                    </p>
                )}
            </div>
        </div>
    );
}