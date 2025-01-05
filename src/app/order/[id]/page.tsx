'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getDoc, doc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/data/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import {handleGooglePayClick} from "@/services/orderService";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    sold: boolean;
}

export default function OrderPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user] = useAuthState(auth);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const router = useRouter();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        phone: '',
    });

    useEffect(() => {
        if (!id) return;

        const fetchProductDetails = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, 'products', String(id));
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProduct({
                        id: docSnap.id,
                        name: data.name || '',
                        description: data.description || '',
                        price: data.price || 0,
                        category: data.category || '',
                        image: data.image || '',
                        sold: data.sold || false,
                    });
                    setError(null);
                } else {
                    setError('Prodotto non trovato');
                }
            } catch {
                setError('Errore nel recupero dei dettagli del prodotto');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleOrderSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!user) {
            alert('Devi essere autenticato per completare l\'acquisto.');
            return;
        }

        if (!product) {
            alert('Prodotto non disponibile.');
            return;
        }

        if (product.sold) {
            alert('Questo prodotto è già stato venduto.');
            return;
        }

        alert('Ordine completato! (Simulazione)');
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Caricamento...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen">{error}</div>;
    }

    return (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 min-h-screen">
            <Header />
            <div className="container mx-auto py-8">
                <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Sezione immagine del prodotto */}
                    <div className="w-full md:w-1/2">
                        <img
                            src={product?.image || '/placeholder.png'}
                            alt={product?.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Sezione dettagli del prodotto */}
                    <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                        <h1 className="text-3xl font-bold text-gray-800">{product?.name}</h1>
                        <p className="text-gray-600 my-2">{product?.description}</p>
                        <p className="text-lg font-semibold text-green-600">€{product?.price}</p>
                        <p className="text-sm text-gray-500">Categoria: {product?.category}</p>
                        <form onSubmit={handleOrderSubmit} className="mt-4">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Dettagli di Spedizione
                            </h2>
                            <label className="block mb-2">
                                Nome completo:
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="block w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring focus:ring-blue-500"
                                />
                            </label>
                            <label className="block mb-2">
                                Indirizzo:
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="block w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring focus:ring-blue-500"
                                />
                            </label>
                            <label className="block mb-2">
                                Telefono:
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="block w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring focus:ring-blue-500"
                                />
                            </label>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition mt-2 w-full"
                            >
                                Conferma Ordine
                            </button>
                        </form>

                        {/* Pulsante Google Pay migliorato */}
                        { product && (
                            <button
                                onClick={() => handleGooglePayClick(product.id, product.price, 'EUR')}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition mt-4 flex items-center gap-2"
                            >
                                <img
                                    src="/google.png"
                                    alt="Google Pay"
                                    className="w-6 h-6"
                                />
                                Paga con Google Pay
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}