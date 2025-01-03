'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Spin, Alert } from 'antd';
import { ShoppingOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';

interface Order {
    id: string;
    productName: string;
    price: number;
    createdAt: string;
    productDetails: {
        name: string;
        description: string;
        price: number;
        image: string;
        category: string;
        condition: string;
        sold: boolean;
    };
    quantity: number;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                fetchOrders(currentUser.uid);
            } else {
                setOrders([]);
                setError("Per favore, effettua l'accesso per visualizzare i tuoi ordini.");
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchOrders = async (buyerId: string) => {
        setIsLoading(true);
        try {
            const q = query(collection(db, 'orders'), where('buyerId', '==', buyerId));
            const querySnapshot = await getDocs(q);
            const ordersData: Order[] = [];

            for (const docSnapshot of querySnapshot.docs) {
                const data = docSnapshot.data();
                const createdAtFormatted = data.createdAt.toDate().toLocaleString('it-IT', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const productRef = doc(db, 'products', data.productId);
                const productDoc = await getDoc(productRef);
                const productData = productDoc.exists() ? productDoc.data() : null;

                if (productData) {
                    const order = {
                        id: docSnapshot.id,
                        productName: productData.name,
                        price: Number(productData.price),
                        createdAt: createdAtFormatted,
                        productDetails: {
                            name: productData.name,
                            description: productData.description,
                            price: Number(productData.price),
                            image: productData.image || '/placeholder.png',
                            category: productData.category,
                            condition: productData.condition,
                            sold: productData.sold,
                        },
                        quantity: data.quantity,
                    };

                    const isDuplicate = ordersData.some(
                        (existingOrder) =>
                            existingOrder.productDetails.name === order.productDetails.name &&
                            existingOrder.productDetails.category === order.productDetails.category &&
                            existingOrder.productDetails.sold === order.productDetails.sold
                    );

                    if (!isDuplicate) {
                        ordersData.push(order);
                    }
                }
            }

            setOrders(ordersData);

            if (ordersData.length === 0) {
                setTimeout(() => {
                    setError('Non hai ancora effettuato alcun ordine. Inizia a fare acquisti!');
                }, 2000);
            }
        } catch (error) {
            console.error('Errore durante il recupero degli ordini:', error);
            setError('Si è verificato un errore durante il recupero degli ordini. Riprova più tardi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">I miei Ordini</h1>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Spin size="large" />
                        <p className="mt-4 text-gray-600">Caricamento ordini...</p>
                    </div>
                ) : error ? (
                    <Alert message={error} type="info" showIcon className="max-w-md mx-auto" />
                ) : orders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                                <div className="h-48 relative">
                                    <Image
                                        src={order.productDetails?.image || '/placeholder.png'}
                                        alt={order.productName}
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{order.productName}</h2>
                                    <div className="flex items-center mb-2 text-gray-600">
                                        <CalendarOutlined className="mr-2" />
                                        <span>{order.createdAt}</span>
                                    </div>
                                    <div className="flex items-center mb-4 text-gray-800">
                                        <DollarOutlined className="mr-2" />
                                        <span className="font-bold">€{order.price.toFixed(2)}</span>
                                    </div>
                                    <div className="text-gray-600 mb-2">
                                        Quantità: {order.quantity}
                                    </div>
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Dettagli del prodotto:</h3>
                                        <p className="text-gray-600 text-sm mb-2">{order.productDetails?.description}</p>
                                        <div className="text-sm text-gray-600">
                                            <p><span className="font-semibold">Categoria:</span> {order.productDetails?.category}</p>
                                            <p><span className="font-semibold">Condizione:</span> {order.productDetails?.condition}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            <ShoppingOutlined className="mr-1" /> Acquistato
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </main>
            <Footer />
        </div>
    );
}