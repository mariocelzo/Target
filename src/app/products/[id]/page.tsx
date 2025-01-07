'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    where,
    deleteDoc
} from 'firebase/firestore';
import { db } from '@/data/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/data/firebase';
import { Timestamp } from 'firebase/firestore';

// ---- Nuovo: per l'alert personalizzato
interface AlertData {
    type: '' | 'success' | 'error';
    message: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    createdAt: Timestamp;
    userId: string;
    image?: string;
}

export default function ProductDetailPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [sellerName, setSellerName] = useState<string | null>(null);
    const [sellerImage, setSellerImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [redirectToChat, setRedirectToChat] = useState<string | null>(null);
    const [currentOffer, setCurrentOffer] = useState<number | null>(null); // eslint-disable-line
    const [maxOffer, setMaxOffer] = useState<number | null>(null);
    const [userOffer, setUserOffer] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [offerAmount, setOfferAmount] = useState<string>('');

    const params = useParams();
    const id = params?.id;
    const [user, loadingUser] = useAuthState(auth);
    const router = useRouter();

    // ---- Nuovo stato: alert personalizzato
    const [alertData, setAlertData] = useState<AlertData>({
        type: '',
        message: '',
    });

    // Chiudi alert
    const closeAlert = () => {
        setAlertData({ type: '', message: '' });
    };

    // 1) Caricamento del prodotto
    useEffect(() => {
        if (!id) return;

        const fetchProductDetails = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, 'products', String(id));
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const productData: Product = {
                        id: docSnap.id,
                        name: data.name || '',
                        description: data.description || '',
                        price: data.price || 0,
                        category: data.category || '',
                        userId: data.userId || '',
                        createdAt: data.createdAt || Timestamp.now(),
                        image: data.image || '',
                    };
                    setProduct(productData);
                    setError(null);

                    // Dati venditore
                    const userDocRef = doc(db, 'users', data.userId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setSellerName(userDocSnap.data().fullName || 'Venditore sconosciuto');
                        setSellerImage(userDocSnap.data().imageUrl || null);
                    }

                    // Offerte
                    const offersRef = collection(db, 'offers');
                    const qOffers = query(offersRef, where('productId', '==', productData.id));
                    const querySnapshot = await getDocs(qOffers);

                    let maxOfferAmount = 0;
                    let userCurrentOffer = null;

                    querySnapshot.forEach((doc) => {
                        const offerData = doc.data();
                        const offerVal = offerData.amount;
                        if (offerVal > maxOfferAmount) {
                            maxOfferAmount = offerVal;
                        }
                        if (offerData.buyerId === user?.uid) {
                            userCurrentOffer = offerVal;
                        }
                    });

                    setMaxOffer(maxOfferAmount);
                    setUserOffer(userCurrentOffer || null);
                } else {
                    setError('Prodotto non trovato');
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setError('Errore nel recupero dei dettagli del prodotto');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetails();
    }, [id, user]);

    // 2) Se esiste un redirectToChat, reindirizza
    useEffect(() => {
        if (redirectToChat) {
            router.push(redirectToChat);
        }
    }, [redirectToChat, router]);

    // Contatta venditore
    const handleContactSeller = async () => {
        if (loadingUser) {
            setAlertData({
                type: 'error',
                message: 'Caricamento in corso...',
            });
            return;
        }
        if (!user) {
            setAlertData({
                type: 'error',
                message: 'Devi essere autenticato per contattare il venditore.',
            });
            return;
        }
        if (!product) {
            setAlertData({
                type: 'error',
                message: 'Prodotto non disponibile.',
            });
            return;
        }

        const chatsRef = collection(db, 'chats');
        const qChats = query(
            chatsRef,
            where('productId', '==', product.id),
            where('buyerId', '==', user.uid),
            where('sellerId', '==', product.userId)
        );

        const querySnapshot = await getDocs(qChats);

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

    // Invio offerta
    const handleMakeOffer = async () => {
        if (!user) {
            setAlertData({
                type: 'error',
                message: 'Devi essere autenticato per fare un\'offerta.',
            });
            return;
        }
        if (!offerAmount || isNaN(Number(offerAmount)) || Number(offerAmount) <= 0) {
            setAlertData({
                type: 'error',
                message: 'Inserisci un importo valido.',
            });
            return;
        }
        const offerAmountValue = Number(offerAmount);
        if (!product) {
            setAlertData({
                type: 'error',
                message: 'Prodotto non disponibile.',
            });
            return;
        }
        if (offerAmountValue > product.price) {
            setAlertData({
                type: 'error',
                message: 'L\'offerta non può superare il prezzo di vendita del prodotto.',
            });
            return;
        }

        try {
            await addDoc(collection(db, 'offers'), {
                productId: product.id,
                buyerId: user.uid,
                amount: offerAmountValue,
                createdAt: serverTimestamp(),
            });

            setUserOffer(offerAmountValue);
            setAlertData({
                type: 'success',
                message: 'Offerta inviata con successo!',
            });
            setShowModal(false);

            if (offerAmountValue >= product.price) {
                setAlertData({
                    type: 'success',
                    message: 'L\'offerta è stata accettata! Il prodotto è stato acquistato.',
                });
            }
        } catch (error) {
            console.error('Errore durante l\'invio dell\'offerta:', error);
            setAlertData({
                type: 'error',
                message: 'Errore durante l\'invio dell\'offerta.',
            });
        }
    };

    // Annulla offerta
    const handleCancelOffer = async () => {
        if (!userOffer) {
            setAlertData({
                type: 'error',
                message: 'Non hai effettuato alcuna offerta.',
            });
            return;
        }

        if (!user) {
            setAlertData({
                type: 'error',
                message: 'Devi essere autenticato per ritirare l\'offerta.',
            });
            return;
        }

        try {
            const offersRef = collection(db, 'offers');
            const qCancel = query(
                offersRef,
                where('productId', '==', product?.id),
                where('buyerId', '==', user.uid)
            );
            const querySnapshot = await getDocs(qCancel);

            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            setUserOffer(null);
            setAlertData({
                type: 'success',
                message: 'Offerta ritirata con successo!',
            });
            setShowModal(false);

        } catch (error) {
            console.error('Errore durante il ritiro dell\'offerta:', error);
            setAlertData({
                type: 'error',
                message: 'Errore durante il ritiro dell\'offerta.',
            });
        }
    };

    // Format data
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

            {/* ALERT PERSONALIZZATO */}
            {alertData.type !== '' && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white max-w-sm w-full rounded-md shadow-lg p-6 relative">
                        {/* Bottone per chiudere l'alert */}
                        <button
                            onClick={() => closeAlert()}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                        >
                            ✕
                        </button>
                        {/* Logo */}
                        <div className="flex justify-center mb-4">
                            <img
                                src="/logoNosfondo.png"
                                alt="Logo"
                                className="h-20 w-auto"
                            />
                        </div>
                        <p
                            className={`text-center text-lg font-semibold ${
                                alertData.type === 'success' ? 'text-teal-600' : 'text-red-600'
                            }`}
                        >
                            {alertData.message}
                        </p>
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={closeAlert}
                                className={`px-6 py-2 rounded-md font-bold 
                  ${
                                    alertData.type === 'success'
                                        ? 'bg-teal-600 hover:bg-teal-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }
                  text-white transition-colors duration-300
                `}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Fine alert personalizzato */}

            <section className="container mx-auto py-16 px-6 lg:px-8 flex flex-col lg:flex-row items-stretch space-y-8 lg:space-y-0">
                {/* Colonna sinistra: Immagine prodotto */}
                <div className="lg:w-1/2 flex items-center justify-center bg-gray-200 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 mr-6 lg:mr-8">
                    <img
                        src={product?.image || '/images/placeholder.jpg'}
                        alt={product?.name}
                        className="w-full h-full object-contain rounded-2xl shadow-md transition-transform duration-300"
                    />
                </div>

                {/* Colonna destra: Dettagli prodotto */}
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

                    {/* Data */}
                    {product?.createdAt && (
                        <p className="text-sm text-gray-500">
                            Pubblicato il: {formatDate(product.createdAt)}
                        </p>
                    )}

                    {/* Venditore */}
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
                            <p className="text-sm text-gray-600">Venduto da: {sellerName}</p>
                        </div>
                    )}

                    {/* Bottoni azione */}
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