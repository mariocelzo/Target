'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// Interfacce per i dati
interface User {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    city: string;
    province: string;
    address: string;
    zipCode: string;
    imageUrl?: string; // Campo opzionale
}

interface Product {
    id: string;
    category: string;
    title: string;
    description: string;
    price: number;
    image: string;
    sold: boolean;
    userId: string;
    user?: User; // Informazioni sull'utente che ha pubblicato il prodotto
}

export default function FurniturePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Recupera l'utente loggato
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) {
                    setIsLoading(false);
                    return;
                }

                // Query Firestore: prodotti della categoria "Arredamento" non venduti
                const q = query(
                    collection(db, 'products'),
                    where('category', '==', 'Arredamento'),
                    where('sold', '==', false) // Esclude i prodotti venduti
                );

                const querySnapshot = await getDocs(q);
                const productList: Product[] = [];

                // Itera sui documenti per costruire l'elenco dei prodotti
                for (const docSnap of querySnapshot.docs) {
                    const productData = docSnap.data() as Omit<Product, 'id' | 'user'>;
                    const productId = docSnap.id;

                    // Escludi i prodotti pubblicati dall'utente loggato
                    if (productData.userId !== user.uid) {
                        // Recupera i dettagli dell'utente che ha pubblicato il prodotto
                        const userDocRef = doc(db, 'users', productData.userId);
                        const userDoc = await getDoc(userDocRef);
                        const userData = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : undefined;

                        productList.push({ id: productId, ...productData, user: userData });
                    }
                }

                setProducts(productList);
                setIsLoading(false);
            } catch (error) {
                console.error('Errore nel recupero dei prodotti:', error);
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-2xl text-gray-600">Caricamento dei prodotti...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-teal-600 to-teal-400 text-white py-12">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl font-extrabold mb-4">Prodotti Moda</h1>
                    <p className="text-lg">Scopri i migliori articoli di moda disponibili</p>
                </div>
            </section>

            {/* Product List */}
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
                                    {/* Immagine prodotto */}
                                    <div className="w-1/3 flex items-center justify-center h-48 bg-gray-100 rounded-l-xl">
                                        <img
                                            src={product.image || '/images/placeholder.jpg'}
                                            alt={product.title}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>

                                    {/* Dettagli prodotto */}
                                    <div className="w-2/3 p-6 flex flex-col space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.title}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                                        <p className="text-lg font-semibold text-teal-600">€ {product.price}</p>

                                        {/* Informazioni sull'utente */}
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