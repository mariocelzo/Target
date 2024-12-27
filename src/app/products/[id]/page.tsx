'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Updated to use useParams
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '../../components/Header'; // Import Header component
import Footer from '../../components/Footer' ; // Import Footer component

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    createdAt: string;
    userId: string;
    image?: string;
}

export default function ProductDetailPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams(); // Get all params from the route

    // Safely extract the 'id' parameter
    const id = params?.id;

    useEffect(() => {
        console.log("Product ID:", id);

        if (!id) return; // Early return if id is not available

        const fetchProductDetails = async () => {
            setIsLoading(true);
            try {
                // @ts-ignore
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const productData: Product = {
                        id: docSnap.id,
                        name: data.name || '',
                        description: data.description || '',
                        price: data.price || 0,
                        category: data.category || '',
                        createdAt: data.createdAt || '',
                        userId: data.userId || '',
                        image: data.image || '',
                    };
                    setProduct(productData);
                    setError(null);
                } else {
                    setError('Prodotto non trovato');
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setError('Errore nel recupero dei dettagli del prodotto');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]); // Use id as the dependency

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-2xl text-gray-600">Caricamento del prodotto...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-2xl text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Add Header */}
            <Header />

            <section className="bg-[#41978F] text-white py-8">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-extrabold mb-3">{product?.name}</h1>
                    <p className="text-md">{product?.category}</p>
                </div>
            </section>

            <section className="container mx-auto py-8 px-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden max-w-2xl mx-auto">
                    <div className="h-64 bg-gray-200 flex items-center justify-center">
                        <img
                            src={product?.image || '/images/placeholder.jpg'}
                            alt={product?.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="text-lg font-bold mb-2">Descrizione</h3>
                        <p className="text-sm text-gray-600 mb-4">{product?.description}</p>
                        <p className="text-xl text-gray-800 font-bold">€ {product?.price}</p>

                        {/* Buttons */}
                        <div className="mt-6 flex justify-between space-x-4">
                            <button
                                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none"
                                onClick={() => alert('Acquisto effettuato!')}
                            >
                                Acquista
                            </button>
                            <button
                                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none flex items-center space-x-2"
                                onClick={() => alert('Contatta il venditore')}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5" // Smaller icon size
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M20 2H4C3.44772 2 3 2.44772 3 3V17C3 17.5523 3.44772 18 4 18H16L20 22V3C20 2.44772 19.5523 2 19 2Z"
                                    />
                                </svg>
                                <span>Contatta il venditore</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Add Footer */}
            <Footer />
        </div>
    );
}
