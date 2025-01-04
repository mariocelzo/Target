'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDoc, doc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

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
    const [user, loadingUser] = useAuthState(auth);
    const router = useRouter();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        phone: '',
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [googlePayReady, setGooglePayReady] = useState(false);

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleOrderSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (loadingUser) {
            alert('Caricamento in corso...');
            return;
        }

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

        const orderDetails = {
            productId: product.id,
            buyerId: user.uid,
            quantity: 1,
            shippingAddress: formData.address,
            phone: formData.phone,
            fullName: formData.fullName,
            createdAt: serverTimestamp(),
        };

        try {
            const ordersRef = collection(db, 'orders');
            await addDoc(ordersRef, orderDetails);

            await updateDoc(doc(db, 'products', product.id), {
                sold: true,
            });

            router.push(`/ordereffettuati`);
        } catch (error) {
            console.error('Errore durante la creazione dell\'ordine', error);
            alert('Si è verificato un errore durante l\'ordine.');
        }
    };

    const loadGooglePay = () => {
        const script = document.createElement('script');
        script.src = "https://pay.google.com/gp/p/js/pay.js";
        script.async = true;
        script.onload = () => {
            const paymentsClient = new google.payments.api.PaymentsClient({
                environment: 'TEST',
            });

            const paymentRequest: google.payments.api.PaymentDataRequest = {
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [{
                    type: 'CARD',
                    parameters: {
                        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                        allowedCardNetworks: ['MASTERCARD', 'VISA'],
                    },
                    tokenizationSpecification: {
                        type: 'PAYMENT_GATEWAY',
                        parameters: {
                            gateway: 'example',
                            gatewayMerchantId: 'exampleMerchantId',
                        },
                    },
                }],
                transactionInfo: {
                    totalPriceStatus: 'FINAL',
                    totalPrice: product?.price.toString() || '0',
                    currencyCode: 'EUR',
                },
                merchantInfo: {
                    merchantName: 'E-commerce Store',
                    merchantId: '0123456789',
                },
            };

            paymentsClient.isReadyToPay(paymentRequest).then((response) => {
                if (response.result) {
                    setGooglePayReady(true);
                }
            });
        };
        document.body.appendChild(script);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleGooglePayClick = () => {
        const paymentsClient = new google.payments.api.PaymentsClient({
            environment: 'TEST',
        });

        const paymentRequest: google.payments.api.PaymentDataRequest = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [{
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['MASTERCARD', 'VISA'],
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'example',
                        gatewayMerchantId: 'exampleMerchantId',
                    },
                },
            }],
            transactionInfo: {
                totalPriceStatus: 'FINAL',
                totalPrice: product?.price.toString() || '0',
                currencyCode: 'EUR',
            },
            merchantInfo: {
                merchantName: 'E-commerce Store',
                merchantId: '0123456789',
            },
        };

        paymentsClient.loadPaymentData(paymentRequest).then((paymentData) => {
            console.log('Dati di pagamento ricevuti:', paymentData);
            alert('Pagamento completato');
            handleOrderSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
        }).catch((error) => {
            console.error('Errore nel pagamento Google Pay:', error);
            alert('Si è verificato un errore durante il pagamento.');
        });
    };

    useEffect(() => {
        loadGooglePay();
    }, [product]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Caricamento...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen">{error}</div>;
    }

    return (
        <div>
            <Header />
            <div className="container mx-auto py-8">
                <h1 className="text-2xl font-bold">Ordine per {product?.name}</h1>
                <div className="mt-6">
                    <img src={product?.image} alt={product?.name} className="w-64 h-64 object-cover" />
                    <p className="mt-4">{product?.description}</p>
                    <p className="mt-2 text-lg font-semibold">Prezzo: €{product?.price}</p>
                </div>
                <form onSubmit={handleOrderSubmit} className="mt-8">
                    <label className="block mb-2">
                        Nome completo:
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="block w-full border p-2 mt-1"
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
                            className="block w-full border p-2 mt-1"
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
                            className="block w-full border p-2 mt-1"
                        />
                    </label>
                    <button
                        type="submit"
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Conferma Ordine
                    </button>
                </form>
                {googlePayReady && (
                    <button
                        onClick={handleGooglePayClick}
                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Paga con Google Pay
                    </button>
                )}
            </div>
            <Footer />
        </div>
    );
}