'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Spin, Alert, Card, Typography, Tag, Divider } from 'antd';
import { ShoppingOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

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

                // Verifica se createdAt esiste e può essere convertito
                let createdAtFormatted = 'Data non disponibile';
                if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                    createdAtFormatted = data.createdAt.toDate().toLocaleString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }

                // Recupera i dettagli del prodotto
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
                        quantity: data.quantity || 1, // Default a 1 se non esiste
                    };

                    // Evita duplicati
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
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto py-8 px-4">
                <Title level={2} className="mb-6">I miei Ordini</Title>
                {isLoading ? (
                    <div className="text-center">
                        <Spin size="large" />
                        <Text className="mt-4 block">Caricamento ordini...</Text>
                    </div>
                ) : error ? (
                    <Alert message={error} type="info" showIcon />
                ) : orders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {orders.map((order) => (
                            <Card
                                key={order.id}
                                hoverable
                                cover={
                                    <div className="h-48 relative">
                                        <Image
                                            src={order.productDetails?.image || '/placeholder.png'}
                                            alt={order.productName}
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                    </div>
                                }
                                className="shadow-md"
                            >
                                <Title level={4} className="text-sm sm:text-base">{order.productName}</Title>
                                <div className="flex items-center mb-2">
                                    <CalendarOutlined className="mr-2" />
                                    <Text type="secondary">{order.createdAt}</Text>
                                </div>
                                <div className="flex items-center mb-4">
                                    <DollarOutlined className="mr-2" />
                                    <Text strong>€{order.price.toFixed(2)}</Text>
                                </div>
                                <div className="flex items-center mb-2">
                                    <Text type="secondary">Quantità: {order.quantity}</Text>
                                </div>
                                <Divider />
                                <div className="mt-4">
                                    <Title level={5} className="text-xs sm:text-sm">Dettagli del prodotto:</Title>
                                    <Text className="text-xs sm:text-sm">{order.productDetails?.description}</Text>
                                    <div className="mt-2 text-xs sm:text-sm">
                                        <Text strong>Categoria:</Text> {order.productDetails?.category}
                                    </div>
                                    <div className="mt-2 text-xs sm:text-sm">
                                        <Text strong>Condizione:</Text> {order.productDetails?.condition}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Tag color="blue"><ShoppingOutlined /> Acquistato</Tag>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : null}
            </main>
            <Footer />
        </div>
    );
}