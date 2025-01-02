'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { LogOut, ChevronDown, Package } from 'lucide-react';
import Header from "@/app/components/Header";

interface Order {
    id: string;
    productName: string;
    price: number;
    createdAt: string;
    productDetails: any; // Aggiungi i dettagli del prodotto
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Listener per l'autenticazione dell'utente
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchOrders(currentUser.uid); // Recupera gli ordini per buyerId
            } else {
                setUser(null);
                setOrders([]); // Se non c'è un utente loggato, resetta gli ordini
            }
        });
        return () => unsubscribe(); // Pulisce il listener
    }, []);

    // Funzione per recuperare gli ordini dell'utente usando buyerId e dati del prodotto
    const fetchOrders = async (buyerId: string) => {
        setIsLoading(true);
        try {
            // Filtro gli ordini in base al buyerId
            const q = query(collection(db, 'orders'), where('buyerId', '==', buyerId));
            const querySnapshot = await getDocs(q);
            const ordersData: Order[] = [];

            for (const docSnapshot of querySnapshot.docs) {
                const data = docSnapshot.data();
                let createdAtFormatted = '';
                if (data.createdAt && data.createdAt.toDate) {
                    createdAtFormatted = data.createdAt.toDate().toLocaleString();
                } else {
                    createdAtFormatted = new Date(data.createdAt).toLocaleString();
                }

                // Ottieni i dettagli del prodotto utilizzando l'ID prodotto salvato nell'ordine
                const productRef = doc(db, 'products', data.productId); // Assicurati che l'ordine contenga un campo 'productId'
                const productDoc = await getDoc(productRef);
                const productData = productDoc.exists() ? productDoc.data() : null;

                ordersData.push({
                    id: docSnapshot.id,
                    productName: data.productName,
                    price: data.price,
                    createdAt: createdAtFormatted,
                    productDetails: productData, // Aggiungi i dettagli del prodotto
                });
            }
            setOrders(ordersData); // Aggiorna lo stato degli ordini
        } catch (error) {
            console.error('Errore durante il recupero degli ordini:', error);
        } finally {
            setIsLoading(false); // Completa il caricamento
        }
    };

    // Toggle del menu a tendina
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    // Funzione per fare logout
    const handleLogout = async () => {
        try {
            await auth.signOut();
            setUser(null); // Reset dell'utente dopo il logout
        } catch (error) {
            console.error('Errore durante il logout:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <Header/>

            {/* Orders Section */}
            <main className="container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">I miei Ordini</h1>
                {isLoading ? (
                    <p>Caricamento ordini...</p>
                ) : orders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white shadow-md rounded-lg p-4">
                                <h2 className="text-lg font-semibold">{order.productName}</h2>

                                <p className="text-gray-500 text-sm">Acquistato il: {order.createdAt}</p>
                                <div className="mt-4">
                                    {order.productDetails ? (
                                        <>
                                            <h3 className="text-md font-semibold">Dettagli del prodotto:</h3>
                                            <p>Nome: {order.productDetails.name}</p>
                                            <p>Descrizione: {order.productDetails.description}</p>
                                            <p>Prezzo: €{order.productDetails.price}</p> {/* Aggiungi il prezzo del prodotto */}
                                        </>
                                    ) : (
                                        <p>Dettagli prodotto non disponibili.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">Nessun ordine trovato.</p>
                )}
            </main>
        </div>
    );
}
