'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Spin, Alert, Card, Typography, Tag, Divider } from 'antd';
import { ShoppingOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { Order } from '@/data/Autenticazione/order';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getUserOrders } from '@/services/Autenticazione/orderService';

const { Title, Text } = Typography;

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const result = await getUserOrders();
                setOrders(result.orders);
                setError(result.error);
            } catch (err) {
                console.error('Errore durante il caricamento degli ordini:', err);
                setError('Errore durante il caricamento degli ordini. Riprova più tardi.');
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    if (isLoading) {
        // Mostra la rotella di caricamento a schermo intero
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Spin size="large" tip="Caricamento in corso..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto py-8 px-4">
                <Title level={2} className="mb-6">I miei Ordini</Title>
                {error ? (
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
                ) : (
                    <Text type="secondary" className="text-center block">Nessun ordine trovato.</Text>
                )}
            </main>
            <Footer />
        </div>
    );
}