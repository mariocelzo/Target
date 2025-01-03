'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import Link from 'next/link'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { motion } from 'framer-motion';
import { Transition } from '@headlessui/react';

interface Ad {
    id: string
    title: string
    price: string
    image: string
    sold: boolean
    productCategory: string
    description: string
}

interface Order {
    shippingAddress: string
    fullName: string
    phone: string
    productId: string
    quantity: number
    buyerId: string
}

export default function UserArea() {
    const [user, setUser] = useState<import('firebase/auth').User | null>(null)
    const [activeAds, setActiveAds] = useState<Ad[]>([])
    const [soldAds, setSoldAds] = useState<any[]>([]) // Cambiato il tipo in "any" per gestire gli ordini
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user)

                // Carica gli annunci attivi (sold = false)
                const activeAdsQuery = query(
                    collection(db, 'products'),
                    where('userId', '==', user.uid),
                    where('sold', '==', false)  // Annunci attivi
                )

                // Carica gli annunci venduti (sold = true)
                const soldAdsQuery = query(
                    collection(db, 'products'),
                    where('userId', '==', user.uid),
                    where('sold', '==', true)  // Annunci venduti
                )

                // Recupera gli annunci attivi
                const activeSnapshot = await getDocs(activeAdsQuery)
                const activeAdsData: Ad[] = activeSnapshot.docs.map(doc => {
                    const data = doc.data()
                    return {
                        id: doc.id,
                        title: data.title,
                        price: data.price,
                        image: data.image || '/placeholder-image.jpg', // Immagine di fallback
                        sold: data.sold,
                        productCategory: data.productCategory,
                        description: data.description || '', // Descrizione dell'annuncio
                    }
                })
                setActiveAds(activeAdsData)

                // Recupera gli annunci venduti
                const soldSnapshot = await getDocs(soldAdsQuery)
                const soldAdsData: any[] = []
                for (const doc of soldSnapshot.docs) {
                    const data = doc.data()
                    const orderQuery = query(
                        collection(db, 'orders'),
                        where('productId', '==', doc.id) // Prendi gli ordini per il prodotto venduto
                    )
                    const orderSnapshot = await getDocs(orderQuery)
                    orderSnapshot.forEach((orderDoc) => {
                        const orderData = orderDoc.data() as Order
                        soldAdsData.push({
                            ...data,
                            orderDetails: orderData, // Aggiungi i dettagli dell'ordine
                        })
                    })
                }
                setSoldAds(soldAdsData)

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

    const handleDelete = async (adId: string) => {
        try {
            await deleteDoc(doc(db, 'products', adId))
            setActiveAds(activeAds.filter(ad => ad.id !== adId))
            setSoldAds(soldAds.filter(ad => ad.id !== adId))
            alert('Annuncio eliminato con successo.')
        } catch (error) {
            console.error('Errore durante l\'eliminazione dell\'annuncio:', error)
            alert('C\'è stato un errore nell\'eliminazione dell\'annuncio.')
        }
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return (
            <div className="text-center py-10">
                <h1 className="text-3xl font-semibold mb-6">Accedi per visualizzare i tuoi annunci</h1>
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
                    <h1 className="text-5xl font-extrabold mb-4">I tuoi Annunci</h1>
                    <p className="text-2xl font-light">Gestisci i tuoi annunci attivi e venduti</p>
                </div>
            </motion.section>

            <section className="py-16">
                <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Annunci attivi */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-8"
                    >
                        <h2 className="text-3xl font-semibold mb-6 text-gray-800 border-b-2 border-[#41978F] pb-2">Annunci Attivi</h2>
                        {activeAds.length > 0 ? (
                            <div className="grid gap-8 sm:grid-cols-2">
                                {activeAds.map((ad) => (
                                    <Transition
                                        key={ad.id || `fallback-id-${Math.random()}`}
                                        show={true}
                                        enter="transition-all duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="transition-all duration-300"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                                            <Link href={`/edit/${ad.id}`} className="block">
                                                <img
                                                    src={ad.image}
                                                    alt={ad.title}
                                                    className="w-full h-48 object-cover"
                                                    onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')}
                                                />
                                                <div className="p-6">
                                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{ad.title}</h3>
                                                    <p className="text-lg font-bold text-[#41978F] mb-2">{ad.price} €</p>
                                                    <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>
                                                </div>
                                            </Link>
                                            <div className="flex justify-between p-4 bg-gray-50 border-t">
                                                <Link href={`/edit/${ad.id}`} className="text-[#41978F] hover:text-[#2C6E68] font-medium">
                                                    <PencilIcon className="w-5 h-5 inline mr-1" />
                                                    Modifica
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(ad.id)}
                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    <TrashIcon className="w-5 h-5 inline mr-1" />
                                                    Elimina
                                                </button>
                                            </div>
                                        </div>
                                    </Transition>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8 bg-white rounded-lg shadow">Non hai annunci attivi.</p>
                        )}
                    </motion.div>

                    {/* Annunci venduti */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="space-y-8"
                    >
                        <h2 className="text-3xl font-semibold mb-6 text-gray-800 border-b-2 border-[#41978F] pb-2">Annunci Venduti</h2>
                        {soldAds.length > 0 ? (
                            <div className="grid gap-8 sm:grid-cols-2">
                                {soldAds.map((ad) => (
                                    <Transition
                                        key={ad.id || `fallback-id-${Math.random()}`}
                                        show={true}
                                        enter="transition-all duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="transition-all duration-300"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <div className="bg-gray-100 shadow-lg rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                                            <img
                                                src={ad.image}
                                                alt={ad.title}
                                                className="w-full h-48 object-cover"
                                                onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')}
                                            />
                                            <div className="p-6">
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{ad.title}</h3>
                                                <p className="text-lg font-bold text-[#41978F] mb-2">{ad.price} €</p>
                                                <p className="text-sm text-red-600 mb-2">Questo annuncio è stato venduto.</p>
                                                <div className="bg-white p-4 rounded-lg mt-4 shadow-inner">
                                                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Dettagli Ordine</h4>
                                                    <p className="text-gray-700"><span className="font-medium">Nome Acquirente:</span> {ad.orderDetails.fullName}</p>
                                                    <p className="text-gray-700"><span className="font-medium">Indirizzo:</span> {ad.orderDetails.shippingAddress}</p>
                                                    <p className="text-gray-700"><span className="font-medium">Telefono:</span> {ad.orderDetails.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Transition>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8 bg-white rounded-lg shadow">Non hai annunci venduti.</p>
                        )}
                    </motion.div>
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
    );
}
