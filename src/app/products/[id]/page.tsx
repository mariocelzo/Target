'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from "next/link";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

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
    const [redirectToChat, setRedirectToChat] = useState<string | null>(null);
    const params = useParams();
    const id = params?.id;
    const [user, loadingUser] = useAuthState(auth);
    const router = useRouter();

    useEffect(() => {
        if (!id) return;

        const fetchProductDetails = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, 'products', String(id)); // Forza l'id come stringa
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
            } catch (error) {
                setError('Errore nel recupero dei dettagli del prodotto');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    useEffect(() => {
        if (redirectToChat) {
            router.push(redirectToChat);
        }
    }, [redirectToChat, router]);

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

    const handleContactSeller = async () => {
        if (loadingUser) {
            alert('Caricamento in corso...');
            return;
        }

        if (!user) {
            alert('Devi essere autenticato per contattare il venditore.');
            return;
        }

        if (!product) {
            alert('Prodotto non disponibile');
            return;
        }

        const chatsRef = collection(db, 'chats');
        const q = query(
            chatsRef,
            where('productId', '==', product.id),
            where('buyerId', '==', user.uid),
            where('sellerId', '==', product.userId)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const chatId = querySnapshot.docs[0].id;
            setRedirectToChat(`/chat/${chatId}`);
        } else {
            const newChat = {
                productId: product.id,
                buyerId: user.uid,
                sellerId: product.userId,
                messages: [],
                createdAt: serverTimestamp(),
            };

            const chatDoc = await addDoc(chatsRef, newChat);
            setRedirectToChat(`/chat/${chatDoc.id}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
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

                        <div className="mt-6 flex justify-between space-x-4">
                            <Link
                                href={product?.id ? `/order/${product.id}` : '#' }
                                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none"
                            >
                                Acquista
                            </Link>


                            <button
                                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none flex items-center space-x-2"
                                onClick={handleContactSeller}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
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

            <Footer />
        </div>
    );
}

