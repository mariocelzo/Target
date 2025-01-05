'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, getDoc, addDoc } from 'firebase/firestore'
import Link from 'next/link'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import {AnimatePresence, motion} from 'framer-motion'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Transition } from '@headlessui/react'
import {CheckCircleIcon, EyeIcon, ShoppingBagIcon} from "lucide-react";
export interface ShippingAddress {
    address: string
    city: string
    name: string
    province: string
    zipCode: string
}

export interface Offer {
    id: string
    amount: number
    buyerId: string
    createdAt: Date
    productId: string
}

export interface Product {
    id: string
    title: string
    price: string
    image: string
    sold: boolean
    productCategory: string
    description: string
    userId: string
    offers: Offer[] // Cambiato da offers?: Offer[] a offers: Offer[]
}

export interface Order {
    id: string
    buyerId: string
    createdAt: Date
    fullName: string
    phone: string
    productId: string
    quantity: number
    shippingAddress: ShippingAddress
}



export default function UserArea() {
    const [user, setUser] = useState<User | null>(null)
    const [activeAds, setActiveAds] = useState<Product[]>([])
    const [soldAds, setSoldAds] = useState<(Product & { orderDetails?: Order })[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [selectedAd, setSelectedAd] = useState<string | null>(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user)
                await fetchAds(user.uid)
                setLoading(false)
            } else {
                setUser(null)
                setActiveAds([])
                setSoldAds([])
                setLoading(false)
            }
        })

        return () => unsubscribe()
    }, [])

    const fetchAds = async (userId: string) => {
        const activeAdsQuery = query(
            collection(db, 'products'),
            where('userId', '==', userId),
            where('sold', '==', false)
        )
        const soldAdsQuery = query(
            collection(db, 'products'),
            where('userId', '==', userId),
            where('sold', '==', true)
        )

        const [activeSnapshot, soldSnapshot] = await Promise.all([
            getDocs(activeAdsQuery),
            getDocs(soldAdsQuery)
        ])

        const activeAdsData: Product[] = await Promise.all(activeSnapshot.docs.map(async (doc) => {
            const data = doc.data() as Omit<Product, 'id' | 'offers'>
            const offersQuery = query(
                collection(db, 'offers'),
                where('productId', '==', doc.id)
            )
            const offersSnapshot = await getDocs(offersQuery)
            const offers = offersSnapshot.docs.map(offerDoc => ({
                id: offerDoc.id,
                ...offerDoc.data()
            })) as Offer[]
            return {
                id: doc.id,
                ...data,
                offers: offers
            }
        }))

        const soldAdsData: (Product & { orderDetails?: Order })[] = await Promise.all(
            soldSnapshot.docs.map(async (doc) => {
                const data = doc.data() as Omit<Product, 'id'>
                const orderQuery = query(
                    collection(db, 'orders'),
                    where('productId', '==', doc.id)
                )
                const orderSnapshot = await getDocs(orderQuery)
                let orderDetails: Order | undefined
                if (!orderSnapshot.empty) {
                    const orderDoc = orderSnapshot.docs[0]
                    orderDetails = { id: orderDoc.id, ...orderDoc.data() } as Order
                }
                return {
                    id: doc.id,
                    ...data,
                    orderDetails
                }
            })
        )

        setActiveAds(activeAdsData)
        setSoldAds(soldAdsData)
    }

    const handleDelete = async (adId: string) => {
        try {
            await deleteDoc(doc(db, 'products', adId))
            setActiveAds(activeAds.filter(ad => ad.id !== adId))
            alert('Annuncio eliminato con successo.')
        } catch (error) {
            console.error('Errore durante l\'eliminazione dell\'annuncio:', error)
            alert('C\'è stato un errore nell\'eliminazione dell\'annuncio.')
        }
    }

    const handleAcceptOffer = async (adId: string, offerId: string) => {
        try {
            const offerRef = doc(db, 'offers', offerId)
            const offerSnap = await getDoc(offerRef)

            if (!offerSnap.exists()) {
                throw new Error('Offerta non trovata.')
            }

            const offerData = offerSnap.data() as Offer

            const buyerRef = doc(db, 'users', offerData.buyerId)
            const buyerSnap = await getDoc(buyerRef)

            if (!buyerSnap.exists()) {
                throw new Error('Dettagli dell\'acquirente non trovati.')
            }

            const buyerData = buyerSnap.data()

            const shippingAddress: ShippingAddress = {
                name: buyerData.fullName || 'Nome non disponibile',
                address: buyerData.address || 'In attesa',
                city: buyerData.city || 'In attesa',
                zipCode: buyerData.zipCode || 'In attesa',
                province: buyerData.province || 'In attesa'
            }

            // Aggiorna il prodotto come venduto e imposta il nuovo prezzo
            await updateDoc(doc(db, 'products', adId), {
                sold: true,
                price: offerData.amount.toString()
            })

            const orderRef = await addDoc(collection(db, 'orders'), {
                productId: adId,
                buyerId: offerData.buyerId,
                fullName: buyerData.fullName || 'Nome non disponibile',
                phone: buyerData.phone || 'In attesa',
                quantity: 1,
                shippingAddress,
                createdAt: new Date(),
            })

            await updateDoc(offerRef, { accepted: true })

            // Aggiorna lo stato locale
            const updatedActiveAds = activeAds.filter(ad => ad.id !== adId)
            const soldAd = activeAds.find(ad => ad.id === adId)
            if (soldAd) {
                setSoldAds([
                    ...soldAds,
                    {
                        ...soldAd,
                        price: offerData.amount.toString(),
                        orderDetails: {
                            id: orderRef.id,
                            productId: adId,
                            buyerId: offerData.buyerId,
                            fullName: buyerData.fullName || 'Nome non disponibile',
                            phone: buyerData.phone || 'In attesa',
                            quantity: 1,
                            shippingAddress,
                            createdAt: new Date(),
                        }
                    }
                ])
            }
            setActiveAds(updatedActiveAds)

            alert('Offerta accettata con successo.')
        } catch (error) {
            console.error('Errore durante l\'accettazione dell\'offerta:', error)
            alert('C\'è stato un errore nell\'accettazione dell\'offerta.')
        }
    }

    if (loading) {
        return <LoadingSpinner />
    }

    if (!user) {
        return (
            <div className="text-center py-10">
                <h1 className="text-3xl font-semibold mb-6">Accedi per visualizzare i tuoi ordini</h1>
                <Link href="/login" className="text-blue-600 hover:text-blue-800 text-lg">Accedi</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <Header />

            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-[#41978F] to-[#2C6E68] text-white py-20"
            >
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl font-extrabold mb-4 tracking-tight">La tua Area Personale</h1>
                    <p className="text-2xl font-light">Gestisci i tuoi annunci con facilità</p>
                </div>
            </motion.section>

            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-[#41978F] pb-2">Annunci Attivi</h2>
                    <AnimatePresence>
                        {activeAds.length > 0 ? (
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
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
                                        <div className="relative">
                                            <img src={ad.image} alt={ad.title} className="w-full h-48 object-cover" />
                                            <div className="absolute top-0 right-0 bg-[#41978F] text-white px-2 py-1 m-2 rounded-md text-sm font-semibold">
                                                {ad.productCategory}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold mb-2 text-gray-800">{ad.title}</h3>
                                            <p className="text-gray-600 mb-4 line-clamp-2">{ad.description}</p>
                                            <p className="text-2xl font-bold mb-4 text-[#41978F]">{ad.price} €</p>
                                            <div className="mb-4">
                                                <button
                                                    onClick={() => setSelectedAd(selectedAd === ad.id ? null : ad.id)}
                                                    className="w-full bg-[#41978F] hover:bg-[#357b74] text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center justify-center"
                                                >
                                                    <EyeIcon className="h-5 w-5 mr-2" />
                                                    {selectedAd === ad.id ? 'Nascondi offerte' : `Mostra offerte (${ad.offers.length})`}
                                                </button>
                                            </div>
                                            <AnimatePresence>
                                                {selectedAd === ad.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        {ad.offers.length > 0 ? (
                                                            <ul className="space-y-2">
                                                                {ad.offers.map((offer) => (
                                                                    <li key={offer.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                                                        <span className="font-medium text-gray-800">{offer.amount} €</span>
                                                                        <button
                                                                            onClick={() => handleAcceptOffer(ad.id, offer.id)}
                                                                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded transition duration-300 ease-in-out flex items-center"
                                                                        >
                                                                            <CheckCircleIcon className="h-5 w-5 mr-1" />
                                                                            Accetta
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-gray-500 italic">Nessuna offerta ricevuta</p>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <div className="mt-6 flex justify-end">
                                                <button
                                                    onClick={() => handleDelete(ad.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
                                                >
                                                    <TrashIcon className="h-5 w-5 mr-2" />
                                                    Elimina
                                                </button>
                                            </div>
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
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun annuncio attivo</h3>
                                <p className="mt-1 text-sm text-gray-500">Inizia creando il tuo primo annuncio.</p>
                                <div className="mt-6">
                                    <Link href="/crea-annuncio" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#41978F] hover:bg-[#357b74] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#41978F]">
                                        Crea un annuncio
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <h2 className="text-3xl font-bold mt-16 mb-8 text-gray-800 border-b-2 border-[#41978F] pb-2">Annunci Venduti</h2>
                    <AnimatePresence>
                        {soldAds.length > 0 ? (
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
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
                                        <div className="relative">
                                            <img src={ad.image} alt={ad.title} className="w-full h-48 object-cover filter brightness-75" />
                                            <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1 m-2 rounded-md text-sm font-semibold">
                                                Venduto
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold mb-2 text-gray-800">{ad.title}</h3>
                                            <p className="text-2xl font-bold mb-4 text-green-500">{ad.price} €</p>
                                            {ad.orderDetails && (
                                                <div className="bg-gray-100 p-4 rounded-lg">
                                                    <h4 className="font-semibold mb-2 text-gray-700">Dettagli Ordine:</h4>
                                                    <p className="text-gray-600"><span className="font-medium">Acquirente:</span> {ad.orderDetails.fullName}</p>
                                                    <p className="text-gray-600"><span className="font-medium">Telefono:</span> {ad.orderDetails.phone}</p>
                                                    <p className="text-gray-600"><span className="font-medium">Indirizzo:</span> {ad.orderDetails.shippingAddress.address}, {ad.orderDetails.shippingAddress.city}</p>
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
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun annuncio venduto</h3>
                                <p className="mt-1 text-sm text-gray-500">I tuoi annunci venduti appariranno qui.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            <Footer />
        </div>
    )
}

function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#41978F]"></div>
        </div>
    )
}

