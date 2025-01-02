'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where, deleteDoc } from 'firebase/firestore';
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
    createdAt: any;
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
    const [currentOffer, setCurrentOffer] = useState<number | null>(null);
    const [maxOffer, setMaxOffer] = useState<number | null>(null);  // Massima offerta ricevuta da tutti i clienti
    const [userOffer, setUserOffer] = useState<number | null>(null);
    const params = useParams();
    const id = params?.id;
    const [user, loadingUser] = useAuthState(auth);
    const [showModal, setShowModal] = useState(false);
    const [offerAmount, setOfferAmount] = useState<string>('');
    const router = useRouter();

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
                        createdAt: data.createdAt,
                        userId: data.userId || '',
                        image: data.image || '',
                    };
                    setProduct(productData);
                    setError(null);

                    const userDocRef = doc(db, 'users', data.userId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setSellerName(userDocSnap.data().fullName || 'Venditore sconosciuto');
                        setSellerImage(userDocSnap.data().imageUrl || null);
                    }

                    const offersRef = collection(db, 'offers');
                    const q = query(offersRef, where('productId', '==', productData.id));
                    const querySnapshot = await getDocs(q);

                    let maxOfferAmount = 0;  // Massima offerta ricevuta da tutti i clienti
                    let userCurrentOffer = null;

                    querySnapshot.forEach(doc => {
                        const offerData = doc.data();
                        const offerAmount = offerData.amount;

                        if (offerAmount > maxOfferAmount) {
                            maxOfferAmount = offerAmount;
                        }

                        if (offerData.buyerId === user?.uid) {
                            userCurrentOffer = offerAmount;
                        }
                    });

                    setMaxOffer(maxOfferAmount);  // Imposta la massima offerta di tutti gli utenti
                    setUserOffer(userCurrentOffer || null);  // Imposta la tua offerta attuale
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
    }, [id, user]);

    useEffect(() => {
        if (redirectToChat) {
            router.push(redirectToChat);
        }
    }, [redirectToChat, router]);

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

    const handleMakeOffer = async () => {
        if (!user) {
            alert('Devi essere autenticato per fare un\'offerta.');
            return;
        }

        if (!offerAmount || isNaN(Number(offerAmount)) || Number(offerAmount) <= 0) {
            alert('Inserisci un importo valido.');
            return;
        }

        const offerAmountValue = Number(offerAmount);

        if (offerAmountValue > product?.price) {
            alert('L\'offerta non può superare il prezzo di vendita del prodotto.');
            return;
        }

        try {
            await addDoc(collection(db, 'offers'), {
                productId: product?.id,
                buyerId: user.uid,
                amount: offerAmountValue,
                createdAt: serverTimestamp(),
            });

            setUserOffer(offerAmountValue);
            alert('Offerta inviata con successo!');
            setShowModal(false);

            if (offerAmountValue >= product?.price) {
                alert('L\'offerta è stata accettata! Il prodotto è stato acquistato.');
            }

        } catch (error) {
            console.error('Errore durante l\'invio dell\'offerta:', error);
            alert('Errore durante l\'invio dell\'offerta.');
        }
    };

    const handleCancelOffer = async () => {
        if (!userOffer) {
            alert('Non hai effettuato alcuna offerta.');
            return;
        }

        try {
            // Trova l'offerta dell'utente
            const offersRef = collection(db, 'offers');
            const q = query(offersRef, where('productId', '==', product?.id), where('buyerId', '==', user.uid));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            setUserOffer(null);
            alert('Offerta ritirata con successo!');
            setShowModal(false);

        } catch (error) {
            console.error('Errore durante il ritiro dell\'offerta:', error);
            alert('Errore durante il ritiro dell\'offerta.');
        }
    };

    const formatDate = (createdAt: any) => {
        const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
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
        <div className="min-h-screen bg-gray-50">
            <Header />

            <section className="bg-[#41978F] text-white py-8 shadow-lg">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl font-extrabold mb-3">{product?.name}</h1>
                    <p className="text-lg font-semibold">{product?.category}</p>
                </div>
            </section>

            <section className="container mx-auto py-12 px-6 lg:px-8">
                <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden max-w-3xl mx-auto">
                    <div className="h-96 bg-gray-200 flex items-center justify-center">
                        <img
                            src={product?.image || '/images/placeholder.jpg'}
                            alt={product?.name}
                            className="w-full h-full object-cover rounded-lg shadow-md"
                        />
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-700 mb-3">Descrizione</h3>
                        <p className="text-sm text-gray-600 mb-6">{product?.description}</p>
                        <p className="text-2xl text-gray-800 font-bold">€ {product?.price}</p>

                        {userOffer !== null && (
                            <p className="text-xl text-gray-600 mt-4">La tua offerta: € {userOffer}</p>
                        )}

                        {maxOffer !== null && maxOffer > 0 && (
                            <p className="text-xl text-gray-600 mt-4">Massima offerta ricevuta: € {maxOffer}</p>
                        )}

                        {product?.createdAt && (
                            <p className="text-sm text-gray-500 mt-2">
                                Pubblicato il: {formatDate(product.createdAt)}
                            </p>
                        )}

                        {sellerName && (
                            <div className="mt-6 flex items-center space-x-4">
                                <img
                                    src={sellerImage ? sellerImage : '/images/default-profile.jpg'}
                                    alt={sellerName}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                                />
                                <p className="text-sm text-gray-600">Venduto da: {sellerName}</p>
                            </div>
                        )}

                        <div className="mt-8 flex justify-between space-x-4">
                            <Link
                                href={product?.id ? `/order/${product.id}` : '#'}
                                className="bg-red-600 text-white py-3 px-6 rounded-lg text-lg hover:bg-red-700 focus:outline-none transition"
                            >
                                Acquista
                            </Link>

                            <button
                                className="bg-red-600 text-white py-3 px-6 rounded-lg text-lg hover:bg-red-700 focus:outline-none transition"
                                onClick={handleContactSeller}
                            >
                                Contatta il venditore
                            </button>

                            <button
                                className="bg-red-600 text-white py-3 px-6 rounded-lg text-lg hover:bg-red-700 focus:outline-none transition"
                                onClick={() => setShowModal(true)}
                            >
                                Fai un'offerta
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Inserisci la tua offerta</h2>
                        <input
                            type="number"
                            placeholder="Importo offerta"
                            className="w-full border border-gray-300 rounded-lg p-2 mb-4"
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
                                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
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
