'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDoc, doc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/data/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });
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

        try {
            const productRef = doc(db, 'products', product.id);
            const productDoc = await getDoc(productRef);

            if (!productDoc.exists()) {
                alert('Dettagli del prodotto non trovati.');
                return;
            }

            const productData = productDoc.data();
            const sellerId = productData.userId;

            const orderDetails = {
                productId: product.id,
                buyerId: user.uid,
                sellerId,
                quantity: 1,
                shippingAddress: formData.address,
                phone: formData.phone,
                fullName: formData.fullName,
                createdAt: serverTimestamp(),
            };

            const ordersRef = collection(db, 'orders');
            await addDoc(ordersRef, orderDetails);

            await updateDoc(doc(db, 'products', product.id), {
                sold: true,
            });

            router.push(`/ordereffettuati`);
        } catch (error) {
            console.error('Errore durante la creazione dell\'ordine:', error);
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
        return <div className="flex items-center justify-center min-h-screen text-gray-700">Caricamento...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-teal-50 to-white pattern-background">
            <Header />
            <div className="container mx-auto py-10 px-6 bg-white bg-opacity-90 rounded-2xl shadow-xl my-10 transition-transform transform hover:scale-105">
                <h1 className="text-4xl font-extrabold text-center text-teal-700 mb-8">Completa il tuo acquisto</h1>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/2 flex justify-center">
                        <img src={product?.image} alt={product?.name} className="w-full h-auto object-cover rounded-2xl shadow-lg transition-all hover:shadow-2xl" />
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{product?.name}</h2>
                        <p className="text-gray-600 mb-6">{product?.description}</p>
                        <p className="text-3xl font-bold text-teal-600 mb-6">€{product?.price}</p>
                    </div>
                </div>
                <form onSubmit={handleOrderSubmit} className="mt-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="block">
                            <span className="font-medium text-teal-700">Nome completo</span>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                placeholder="Mario Rossi"
                                className="mt-2 w-full border border-gray-300 p-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
                            />
                        </label>
                        <label className="block">
                            <span className="font-medium text-teal-700">Indirizzo</span>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                placeholder="Via Roma 1, Milano"
                                className="mt-2 w-full border border-gray-300 p-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
                            />
                        </label>
                        <label className="block">
                            <span className="font-medium text-teal-700">Telefono</span>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="+39 123 456 7890"
                                className="mt-2 w-full border border-gray-300 p-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
                            />
                        </label>
                        <label className="block">
                            <span className="font-medium text-teal-700">Numero Carta di Credito</span>
                            <input
                                type="text"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleChange}
                                required
                                placeholder="1234 5678 9012 3456"
                                className="mt-2 w-full border border-gray-300 p-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
                            />
                        </label>
                        <label className="block">
                            <span className="font-medium text-teal-700">Data di Scadenza</span>
                            <input
                                type="text"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                required
                                placeholder="MM/AA"
                                className="mt-2 w-full border border-gray-300 p-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
                            />
                        </label>
                        <label className="block">
                            <span className="font-medium text-teal-700">CVV</span>
                            <input
                                type="text"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleChange}
                                required
                                placeholder="123"
                                className="mt-2 w-full border border-gray-300 p-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
                            />
                        </label>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 mt-6">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors transform hover:scale-105 shadow-lg"
                        >
                            Conferma Ordine
                        </button>
                        {googlePayReady && (
                            <button
                                type="button"
                                onClick={handleGooglePayClick}
                                className="flex-1 flex items-center justify-center bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors transform hover:scale-105 shadow-lg"
                            >
                                <img src="/google.png" alt="Google Pay" className="w-6 h-6 mr-2" />
                                Paga con Google Pay
                            </button>
                        )}
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}