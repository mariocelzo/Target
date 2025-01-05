'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

import { auth } from '@/data/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

// Import dal Service Layer
import {
    getProductDetails,
    contactSeller,
    makeOffer,
    cancelOffer,
} from '@/services/productService';

/**
 * Stessa interfaccia definita (o analoga) nel tuo productRepository,
 * con `image?: string; condition: string; sold: boolean;`
 */
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    userId: string;
    createdAt: Timestamp;
    image?: string;       // resa opzionale
    condition: string;    // obbligatoria
    sold: boolean;        // obbligatoria
}

export default function ProductDetailPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [sellerName, setSellerName] = useState<string | null>(null);
    const [sellerImage, setSellerImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [maxOffer, setMaxOffer] = useState<number | null>(null);
    const [userOffer, setUserOffer] = useState<number | null>(null);

    const [redirectToChat, setRedirectToChat] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [offerAmount, setOfferAmount] = useState<string>('');

    const params = useParams();
    const router = useRouter();

    // Convertiamo params.id in una semplice stringa
    const rawId = params?.id;
    const productId = typeof rawId === 'string' ? rawId : rawId?.[0] ?? '';

    useEffect(() => {
        if (!productId) return; // se manca l'ID, usciamo

        (async () => {
            setIsLoading(true);
            try {
                const result = await getProductDetails(productId, user?.uid);

                if (!result.product) {
                    setError('Prodotto non trovato');
                } else {
                    // Ora result.product è compatibile con il nostro stato
                    setProduct(result.product);
                    setSellerName(result.sellerName);
                    setSellerImage(result.sellerImage);
                    setMaxOffer(result.maxOffer);
                    setUserOffer(result.userOffer);
                    setError(null);
                }
            } catch (err) {
                console.error(err);
                setError('Errore nel recupero dei dettagli del prodotto');
            } finally {
                setIsLoading(false);
            }
        })();
    }, [productId]);

    const [user, loadingUser] = useAuthState(auth);

    // Se dobbiamo reindirizzare alla chat
    useEffect(() => {
        if (redirectToChat) {
            router.push(redirectToChat);
        }
    }, [redirectToChat, router]);

    // Contatta venditore
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
        try {
            const chatId = await contactSeller(product.id, user.uid, product.userId);
            setRedirectToChat(`/chat/${chatId}`);
        } catch (error) {
            console.error(error);
            alert('Errore durante la creazione/trovamento chat.');
        }
    };

    // Fai offerta
    const handleMakeOffer = async () => {
        if (!user) {
            alert("Devi essere autenticato per fare un'offerta.");
            return;
        }
        if (!offerAmount || isNaN(Number(offerAmount)) || Number(offerAmount) <= 0) {
            alert('Inserisci un importo valido.');
            return;
        }
        if (!product) {
            alert('Prodotto non disponibile');
            return;
        }
        if (Number(offerAmount) > product.price) {
            alert("L'offerta non può superare il prezzo di vendita del prodotto.");
            return;
        }

        try {
            await makeOffer(product, user.uid, Number(offerAmount));
            setUserOffer(Number(offerAmount));
            alert('Offerta inviata con successo!');
            setShowModal(false);

            if (Number(offerAmount) >= product.price) {
                alert("L'offerta è stata accettata! Il prodotto è stato acquistato.");
            }
        } catch (err) {
            console.error("Errore durante l'invio dell'offerta:", err);
            alert("Errore durante l'invio dell'offerta.");
        }
    };

    // Cancella offerta
    const handleCancelOffer = async () => {
        if (!userOffer) {
            alert('Non hai effettuato alcuna offerta.');
            return;
        }
        if (!user) {
            alert('Devi essere autenticato per fare questa azione.');
            return;
        }
        if (!product) {
            alert('Prodotto non disponibile');
            return;
        }

        try {
            await cancelOffer(product.id, user.uid);
            setUserOffer(null);
            alert('Offerta ritirata con successo!');
            setShowModal(false);
        } catch (err) {
            console.error("Errore durante il ritiro dell'offerta:", err);
            alert("Errore durante il ritiro dell'offerta.");
        }
    };

    // Formatta Timestamp
    const formatDate = (createdAt: Timestamp) => {
        const date = createdAt.toDate();
        return date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

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
        <div className="min-h-screen bg-gradient-to-r from-red-500 to-teal-500">
            <Header />

            {/* Sezione principale con immagine e dettagli prodotto */}
            <section className="container mx-auto py-16 px-6 lg:px-8 flex flex-col lg:flex-row items-stretch space-y-8 lg:space-y-0">
                {/* Colonna sinistra: Immagine del prodotto */}
                <div className="lg:w-1/2 flex items-center justify-center bg-gray-200 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 mr-6 lg:mr-8">
                    <img
                        src={product?.image || '/images/placeholder.jpg'}
                        alt={product?.name}
                        className="w-full h-full object-contain rounded-2xl shadow-md transition-transform duration-300"
                    />
                </div>

                {/* Colonna destra: Dettagli del prodotto */}
                <div className="lg:w-1/2 p-8 bg-white rounded-2xl shadow-2xl max-w-lg mx-auto lg:mx-0 space-y-6">
                    <h3 className="text-3xl font-bold text-gray-800">{product?.name}</h3>
                    <p className="text-lg font-semibold text-gray-600">{product?.category}</p>
                    <p className="text-sm text-gray-600">{product?.description}</p>
                    <p className="text-3xl text-gray-800 font-semibold">€ {product?.price}</p>

                    {/* Offerte utente */}
                    {userOffer !== null && (
                        <p className="text-xl text-gray-600">La tua offerta: € {userOffer}</p>
                    )}

                    {/* Massima offerta ricevuta */}
                    {maxOffer !== null && maxOffer > 0 && (
                        <p className="text-xl text-gray-600">Massima offerta ricevuta: € {maxOffer}</p>
                    )}

                    {/* Data di pubblicazione */}
                    {product?.createdAt && (
                        <p className="text-sm text-gray-500">
                            Pubblicato il: {formatDate(product.createdAt)}
                        </p>
                    )}

                    {/* Informazioni sul venditore */}
                    {sellerName && (
                        <div className="flex items-center space-x-4 mt-6">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 font-semibold">
                                {sellerImage ? (
                                    <img
                                        src={sellerImage}
                                        alt={sellerName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span>👤</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">
                                Venduto da: {sellerName}
                            </p>
                        </div>
                    )}

                    {/* Bottoni Azione */}
                    <div className="flex space-x-4 mt-8 justify-between">
                        <Link
                            href={product?.id ? `/order/${product.id}` : '#'}
                            className="bg-gradient-to-r from-orange-400 to-red-600 text-white py-2 px-6 rounded-full text-lg font-semibold hover:bg-gradient-to-l hover:from-orange-500 hover:to-red-700 transition-all duration-300"
                        >
                            Acquista
                        </Link>

                        <button
                            className="bg-teal-500 text-white py-2 px-6 rounded-full text-lg font-semibold hover:bg-teal-600 transition-all duration-300"
                            onClick={handleContactSeller}
                        >
                            Contatta
                        </button>

                        <button
                            className="bg-yellow-400 text-white py-2 px-6 rounded-full text-lg font-semibold hover:bg-yellow-500 transition-all duration-300"
                            onClick={() => setShowModal(true)}
                        >
                            Offerta
                        </button>
                    </div>
                </div>
            </section>

            {/* Modale per inserire offerta */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Inserisci la tua offerta</h2>
                        <input
                            type="number"
                            placeholder="Importo offerta"
                            className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                            value={offerAmount}
                            onChange={(e) => setOfferAmount(e.target.value)}
                        />
                        <div className="flex justify-between space-x-4">
                            {userOffer !== null && (
                                <button
                                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                                    onClick={handleCancelOffer}
                                >
                                    Ritira offerta
                                </button>
                            )}
                            <button
                                className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition"
                                onClick={handleMakeOffer}
                            >
                                Invia offerta
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}