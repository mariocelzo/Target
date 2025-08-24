'use client';

import { useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    getDoc,
    addDoc,
    // <-- AGGIUNTA
    onSnapshot, // <------------------- necessario per il real-time
} from 'firebase/firestore';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Transition } from '@headlessui/react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon, EyeIcon, ShoppingBagIcon } from 'lucide-react';

import { auth, db } from '@/data/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// -----------------------
// Tipi di dato
// -----------------------
export interface ShippingAddress {
    address: string;
    city: string;
    name: string;
    province: string;
    zipCode: string;
}

export interface Offer {
    id: string;
    amount: number;
    buyerId: string;
    createdAt: Date; // Se in Firestore è salvato come Timestamp, verifica la conversione
    productId: string;
    accepted?: boolean; // campo facoltativo, se gestisci questo valore
}

export interface Product {
    id: string;
    name: string; // Changed from 'title'
    price: number; // Changed from 'string'
    image: string;
    sold: boolean;
    category: string; // Changed from 'productCategory'
    description: string;
    userId: string;
    offers: Offer[]; // array di offerte
}

export interface Order {
    id: string;
    buyerId: string;
    createdAt: Date; // Se in Firestore è salvato come Timestamp, verifica la conversione
    fullName: string;
    phone: string;
    productId: string;
    quantity: number;
    shippingAddress: ShippingAddress;
}

interface BuyerData {
    fullName?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    phone?: string;
    province?: string;
    // qualunque altro campo ti serva...
}

// -----------------------
// Componente principale
// -----------------------
export default function UserActiveAdsPage() {
    // Stato utente e annunci
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [activeAds, setActiveAds] = useState<Product[]>([]);
    const [soldAds, setSoldAds] = useState<(Product & { orderDetails?: Order })[]>([]);
    const [loading, setLoading] = useState(true);

    // Per mostrare/nascondere le offerte di uno specifico annuncio
    const [selectedAd, setSelectedAd] = useState<string | null>(null);

    /**
     * Controlla l'autenticazione e, se loggato,
     * carica gli annunci dell’utente corrente.
     */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchAds(currentUser.uid);
            } else {
                setUser(null);
                setActiveAds([]);
                setSoldAds([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    /**
     * Recupera annunci attivi, annunci venduti, e relative offerte (per gli attivi).
     */
    const fetchAds = async (userId: string) => {
        // Query per annunci attivi
        const activeAdsQuery = query(
            collection(db, 'products'),
            where('userId', '==', userId),
            where('sold', '==', false)
        );
        // Query per annunci venduti
        const soldAdsQuery = query(
            collection(db, 'products'),
            where('userId', '==', userId),
            where('sold', '==', true)
        );

        const [activeSnapshot, soldSnapshot] = await Promise.all([
            getDocs(activeAdsQuery),
            getDocs(soldAdsQuery)
        ]);

        // Mappa annunci attivi + offerte
        const activeAdsData: Product[] = await Promise.all(
            activeSnapshot.docs.map(async (docSnap) => {
                const data = docSnap.data() as Omit<Product, 'id' | 'offers'>;
                const offersQuery = query(
                    collection(db, 'offers'),
                    where('productId', '==', docSnap.id)
                );
                const offersSnapshot = await getDocs(offersQuery);

                const offers = offersSnapshot.docs.map((offerDoc) => ({
                    id: offerDoc.id,
                    ...offerDoc.data()
                })) as Offer[];

                return {
                    id: docSnap.id,
                    ...data,
                    offers
                };
            })
        );

        // Mappa annunci venduti + dettagli ordine
        const soldAdsData: (Product & { orderDetails?: Order })[] = await Promise.all(
            soldSnapshot.docs.map(async (docSnap) => {
                const data = docSnap.data() as Omit<Product, 'id' | 'offers'>;
                // Per gli annunci venduti, recuperiamo l'ordine associato
                const orderQuery = query(
                    collection(db, 'orders'),
                    where('productId', '==', docSnap.id)
                );
                const orderSnapshot = await getDocs(orderQuery);

                let orderDetails: Order | undefined;
                if (!orderSnapshot.empty) {
                    const orderDoc = orderSnapshot.docs[0];
                    orderDetails = {
                        id: orderDoc.id,
                        ...orderDoc.data()
                    } as Order;
                }

                return {
                    id: docSnap.id,
                    ...data,
                    offers: [], // Nei venduti, di solito le offerte non servono più
                    orderDetails
                };
            })
        );

        setActiveAds(activeAdsData);
        setSoldAds(soldAdsData);
    };

    // <-- AGGIUNTA: funzione di sottoscrizione in tempo reale alle offerte
    /**
     * Questa funzione si occupa di ascoltare in tempo reale
     * le offerte relative agli annunci attivi già caricati.
     */
    const subscribeToOffersRealtime = () => {
        // Se non ho utente loggato o non ho annunci attivi, esco
        if (!user || activeAds.length === 0) return;

        // Estraggo gli ID dei prodotti attivi
        const productIds = activeAds.map((ad) => ad.id);
        if (productIds.length === 0) return;

        // Creo una query che ascolta tutte le `offers` relative a questi productId
        const offersRef = collection(db, 'offers');
        const offersQ = query(offersRef, where('productId', 'in', productIds));

        // Sottoscrizione real-time
        const unsubscribe = onSnapshot(offersQ, (snapshot) => {
            // Ricavo l'elenco di tutte le offerte
            const liveOffers = snapshot.docs.map((docSnap) => {
                return { id: docSnap.id, ...docSnap.data() } as Offer;
            });

            // Raggruppo le offerte per productId
            const offersByProduct: Record<string, Offer[]> = {};
            for (const off of liveOffers) {
                if (!offersByProduct[off.productId]) {
                    offersByProduct[off.productId] = [];
                }
                offersByProduct[off.productId].push(off);
            }

            // Aggiorno le offers di ogni annuncio in activeAds
            setActiveAds((prevAds) =>
                prevAds.map((ad) => {
                    // Se per questo annuncio ci sono offerte, le assegno
                    if (offersByProduct[ad.id]) {
                        return {
                            ...ad,
                            offers: offersByProduct[ad.id],
                        };
                    }
                    // Altrimenti annuncio invariato o con 0 offerte
                    return { ...ad, offers: [] };
                })
            );
        });

        return unsubscribe;
    };
    // <-- Fine AGGIUNTA

    /**
     * Elimina un annuncio dalla collezione "products".
     */
    const handleDelete = async (adId: string) => {
        try {
            await deleteDoc(doc(db, 'products', adId));
            setActiveAds((prev) => prev.filter((ad) => ad.id !== adId));
            alert('Annuncio eliminato con successo.');
        } catch (error) {
            console.error('Errore durante l\'eliminazione dell\'annuncio:', error);
            alert('C\'è stato un errore nell\'eliminazione dell\'annuncio.');
        }
    };

    /**
     * Accetta un'offerta: setta `sold` a true per il prodotto,
     * crea l'ordine in Firestore, e aggiorna lo stato locale.
     */
    const handleAcceptOffer = async (adId: string, offerId: string) => {
        try {
            const offerRef = doc(db, 'offers', offerId);
            const offerSnap = await getDoc(offerRef);

            if (!offerSnap.exists()) {
                throw new Error('Offerta non trovata.');
            }

            const offerData = offerSnap.data() as Offer;

            // Recupera i dati dell'acquirente
            const buyerRef = doc(db, 'users', offerData.buyerId);
            const buyerSnap = await getDoc(buyerRef);

            if (!buyerSnap.exists()) {
                throw new Error('Dettagli dell\'acquirente non trovati.');
            }

            const buyerData = buyerSnap.data() as BuyerData; // tipizza in base alla struttura che hai in Firestore

            // Costruisci l'indirizzo di spedizione
            const shippingAddress: ShippingAddress = {
                name: buyerData.fullName || 'Nome non disponibile',
                address: buyerData.address || 'In attesa',
                city: buyerData.city || 'In attesa',
                zipCode: buyerData.zipCode || 'In attesa',
                province: buyerData.province || 'In attesa'
            };

            // 1) Marca il prodotto come venduto + aggiorna prezzo = offerData.amount
            await updateDoc(doc(db, 'products', adId), {
                sold: true,
                price: offerData.amount.toString()
            });

            // 2) Crea un ordine in Firestore
            const orderRef = await addDoc(collection(db, 'orders'), {
                productId: adId,
                buyerId: offerData.buyerId,
                fullName: buyerData.fullName || 'Nome non disponibile',
                phone: buyerData.phone || 'In attesa',
                quantity: 1,
                shippingAddress,
                createdAt: new Date()
            });

            // 3) Marca l'offerta come accettata (facoltativo)
            await updateDoc(offerRef, { accepted: true });

            // 4) Aggiorna lo stato locale:
            //    - Rimuovi l'annuncio dagli attivi
            //    - Aggiungi l'annuncio nei venduti (con i relativi dettagli)
            const updatedActiveAds = activeAds.filter((ad) => ad.id !== adId);
            const soldAd = activeAds.find((ad) => ad.id === adId);

            if (soldAd) {
                setSoldAds([
                    ...soldAds,
                    {
                        ...soldAd,
                        price: offerData.amount.toString(),
                        offers: [],
                        orderDetails: {
                            id: orderRef.id,
                            productId: adId,
                            buyerId: offerData.buyerId,
                            fullName: buyerData.fullName || 'Nome non disponibile',
                            phone: buyerData.phone || 'In attesa',
                            quantity: 1,
                            shippingAddress,
                            createdAt: new Date()
                        }
                    }
                ]);
            }
            setActiveAds(updatedActiveAds);

            alert('Offerta accettata con successo.');
        } catch (error) {
            console.error('Errore durante l\'accettazione dell\'offerta:', error);
            alert('C\'è stato un errore nell\'accettazione dell\'offerta.');
        }
    };

    // <-- AGGIUNTA: useEffect che attiva la sottoscrizione in tempo reale
    useEffect(() => {
        const unsub = subscribeToOffersRealtime();
        return () => {
            if (typeof unsub === 'function') {
                unsub();
            }
        };
    }, [activeAds, user]);
    // <-- Fine AGGIUNTA

    /**
     * Se sta caricando, mostra uno spinner.
     */
    if (loading) {
        return <LoadingSpinner />;
    }

    /**
     * Se l'utente non è loggato, reindirizza al login.
     */
    if (!user) {
        return (
            <div className="text-center py-10">
                <h1 className="text-3xl font-semibold mb-6">Accedi per visualizzare i tuoi annunci</h1>
                <Link href="/login" className="text-blue-600 hover:text-blue-800 text-lg">
                    Accedi
                </Link>
            </div>
        );
    }

    /**
     * Render principale
     */
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <Header />

            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-[#41978F] to-[#2C6E68] text-white py-20"
            >
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
                        La tua Area Personale
                    </h1>
                    <p className="text-2xl font-light">
                        Gestisci i tuoi annunci con facilità
                    </p>
                </div>
            </motion.section>

            {/* Sezione con tre colonne (three-tier) */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* -- PRIMA COLONNA: Annunci Attivi -- */}
                    <div>
                        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-[#41978F] pb-2">
                            Annunci Attivi
                        </h2>

                        <AnimatePresence>
                            {activeAds.length > 0 ? (
                                <motion.div
                                    className="grid grid-cols-1 gap-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {activeAds.map((ad) => (
                                        <motion.div
                                            key={ad.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                            className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl"
                                        >
                                            {/* Immagine + Categoria */}
                                            <div className="relative">
                                                <img
                                                    src={ad.image}
                                                    alt={ad.name}
                                                    className="w-full h-48 object-cover"
                                                />
                                                <div className="absolute top-0 right-0 bg-[#41978F] text-white px-2 py-1 m-2 rounded-md text-sm font-semibold">
                                                    {ad.category}
                                                </div>
                                            </div>

                                            {/* Dettagli annuncio */}
                                            <div className="p-6">
                                                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                                                    {ad.name}
                                                </h3>
                                                <p className="text-gray-600 mb-4 line-clamp-2">
                                                    {ad.description}
                                                </p>
                                                <p className="text-2xl font-bold mb-4 text-[#41978F]">
                                                    {ad.price} €
                                                </p>

                                                {/* Bottone per mostrare / nascondere offerte */}
                                                <div className="mb-4">
                                                    <button
                                                        onClick={() =>
                                                            setSelectedAd(selectedAd === ad.id ? null : ad.id)
                                                        }
                                                        className="w-full bg-[#41978F] hover:bg-[#357b74] text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center justify-center"
                                                    >
                                                        <EyeIcon className="h-5 w-5 mr-2"/>
                                                        {selectedAd === ad.id
                                                            ? 'Nascondi offerte'
                                                            : `Mostra offerte (${ad.offers.length})`}
                                                    </button>
                                                </div>

                                                {/* Se è l'annuncio selezionato, mostra l'elenco offerte */}
                                                <AnimatePresence>
                                                    {selectedAd === ad.id && (
                                                        <motion.div
                                                            initial={{opacity: 0, height: 0}}
                                                            animate={{opacity: 1, height: 'auto'}}
                                                            exit={{opacity: 0, height: 0}}
                                                            transition={{duration: 0.3}}
                                                        >
                                                            {ad.offers.length > 0 ? (
                                                                <ul className="space-y-2">
                                                                    {ad.offers.map((offer) => (
                                                                        <li
                                                                            key={offer.id}
                                                                            className="flex items-center justify-between bg-gray-100 p-2 rounded"
                                                                        >
                                                                            <span className="font-medium text-gray-800">
                                                                                {offer.amount} €
                                                                            </span>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleAcceptOffer(ad.id, offer.id)
                                                                                }
                                                                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded transition duration-300 ease-in-out flex items-center"
                                                                            >
                                                                                <CheckCircleIcon
                                                                                    className="h-5 w-5 mr-1"/>
                                                                                Accetta
                                                                            </button>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-gray-500 italic">
                                                                    Nessuna offerta ricevuta
                                                                </p>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Bottone Elimina */}
                                                <div className="mt-6 flex justify-between">
                                                    <Link
                                                        href={`/Sellpackage/edit/${ad.id}`}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
                                                    >
                                                        <PencilIcon className="h-5 w-5 mr-2"/>
                                                        Modifica
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(ad.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
                                                    >
                                                        <TrashIcon className="h-5 w-5 mr-2"/>
                                                        Elimina
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    exit={{opacity: 0}}
                                    className="text-center py-10 bg-white rounded-lg shadow-md"
                                >
                                    <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        Nessun annuncio attivo
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Inizia creando il tuo primo annuncio.
                                    </p>
                                    <div className="mt-6">
                                        <Link
                                            href="/sell"
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#41978F] hover:bg-[#357b74] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#41978F]"
                                        >
                                            Crea un annuncio
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* -- SECONDA COLONNA (Tier centrale) -- */}
                    <div>
                        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-[#41978F] pb-2">
                            Il tuo Profilo
                        </h2>
                        <div className="bg-white rounded-lg shadow-md p-6 text-gray-800">
                            <p className="mb-2">
                                <strong>Nome:</strong> {user.displayName || 'N/D'}
                            </p>
                            <p className="mb-2">
                                <strong>Email:</strong> {user.email}
                            </p>
                            {/* Altre informazioni, preferenze utente, ecc. */}
                            <p className="text-sm text-gray-600 mt-4">

                            </p>
                        </div>
                    </div>

                    {/* -- TERZA COLONNA: Annunci Venduti -- */}
                    <div>
                        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-[#41978F] pb-2">
                            Annunci Venduti
                        </h2>
                        <AnimatePresence>
                            {soldAds.length > 0 ? (
                                <motion.div
                                    className="grid grid-cols-1 gap-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {soldAds.map((ad) => (
                                        <motion.div
                                            key={ad.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                            className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl"
                                        >
                                            {/* Immagine Venduto */}
                                            <div className="relative">
                                                <img
                                                    src={ad.image}
                                                    alt={ad.name}
                                                    className="w-full h-48 object-cover filter brightness-75"
                                                />
                                                <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1 m-2 rounded-md text-sm font-semibold">
                                                    Venduto
                                                </div>
                                            </div>

                                            {/* Dettagli annuncio + ordine */}
                                            <div className="p-6">
                                                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                                                    {ad.name}
                                                </h3>
                                                <p className="text-2xl font-bold mb-4 text-green-500">
                                                    {ad.price} €
                                                </p>
                                                {ad.orderDetails && (
                                                    <div className="bg-gray-100 p-4 rounded-lg">
                                                        <h4 className="font-semibold mb-2 text-gray-700">
                                                            Dettagli Ordine:
                                                        </h4>
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Acquirente:</span>{' '}
                                                            {ad.orderDetails.fullName}
                                                        </p>
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Telefono:</span>{' '}
                                                            {ad.orderDetails.phone}
                                                        </p>
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Indirizzo:</span>{' '}
                                                            {ad.orderDetails.shippingAddress.address},{' '}
                                                            {ad.orderDetails.shippingAddress.city}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center py-10 bg-white rounded-lg shadow-md"
                                >
                                    <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        Nessun annuncio venduto
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        I tuoi annunci venduti appariranno qui.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

/**
 * Semplice spinner di caricamento
 */
function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#41978F]" />
        </div>
    );
}

