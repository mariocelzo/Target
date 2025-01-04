'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs, doc, updateDoc, addDoc, getDoc } from 'firebase/firestore'
import Link from 'next/link'
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { motion } from 'framer-motion';

interface Ad {
    id: string
    title: string
    price: string
    image: string
    sold: boolean
    productCategory: string
    description: string
    highestOffer?: Offer | null
}

interface Offer {
    buyerId: string
    amount: number
    createdAt: Date
}

interface ShippingAddress {
    address: string
    city: string
    province: string
    zipCode: string
    name: string
}

export default function UserArea() {
    const [user, setUser] = useState<import('firebase/auth').User | null>(null)
    const [activeAds, setActiveAds] = useState<Ad[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isAddressFormVisible, setIsAddressFormVisible] = useState<boolean>(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user)

                // Recupera gli annunci attivi
                const activeAdsQuery = query(
                    collection(db, 'products'),
                    where('userId', '==', user.uid),
                    where('sold', '==', false)
                )

                const activeSnapshot = await getDocs(activeAdsQuery)
                const activeAdsData: Ad[] = []

                for (const doc of activeSnapshot.docs) {
                    const data = doc.data()

                    // Recupera le offerte relative all'annuncio
                    const offersQuery = query(
                        collection(db, 'offers'),
                        where('productId', '==', doc.id)
                    )
                    const offersSnapshot = await getDocs(offersQuery)
                    const offers: Offer[] = offersSnapshot.docs.map(offerDoc => {
                        const offerData = offerDoc.data()
                        return {
                            buyerId: offerData.buyerId,
                            amount: offerData.amount,
                            createdAt: offerData.createdAt.toDate()
                        }
                    })

                    // Trova l'offerta più alta
                    const highestOffer = offers.length
                        ? offers.reduce((prev, curr) => (prev.amount > curr.amount ? prev : curr), offers[0])
                        : null

                    activeAdsData.push({
                        id: doc.id,
                        title: data.title,
                        price: data.price,
                        image: data.image || '/placeholder-image.jpg',
                        sold: data.sold,
                        productCategory: data.productCategory,
                        description: data.description || '',
                        highestOffer
                    })
                }

                setActiveAds(activeAdsData)
                setLoading(false)
            } else {
                setUser(null)
                setActiveAds([])
                setLoading(false)
            }
        })

        return () => unsubscribe()
    }, [])

    const handleAcceptOffer = async (adId: string, offer: Offer) => {
        try {
            const adRef = doc(db, 'products', adId)
            const adSnap = await getDoc(adRef)
            if (!adSnap.exists()) {
                throw new Error('Annuncio non trovato')
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const adData = adSnap.data()

            const buyerId = offer.buyerId

            // Recupera i dettagli dell'acquirente
            const buyerRef = doc(db, 'users', buyerId)
            const buyerSnap = await getDoc(buyerRef)
            if (!buyerSnap.exists()) {
                throw new Error('Acquirente non trovato')
            }
            const buyerData = buyerSnap.data()

            // Crea il shippingAddress con i dati dell'acquirente
            const buyerShippingAddress = {
                address: buyerData.address,
                city: buyerData.city,
                province: buyerData.province,
                zipCode: buyerData.zipCode,
                name: buyerData.fullName
            }

            // Crea un nuovo ordine per l'acquirente
            const orderData = {
                createdAt: new Date(),
                productId: adId,
                shippingAddress: buyerShippingAddress,
                buyerId: buyerId, // Usa buyerId invece di userId
            }

            // Aggiungi l'ordine alla tabella orders
            const orderRef = await addDoc(collection(db, 'orders'), orderData)
            console.log('Ordine creato con successo:', orderRef.id)

            // Segna l'annuncio come venduto
            await updateDoc(adRef, { sold: true })
            console.log('Annuncio contrassegnato come venduto')

            // Mostra un messaggio di conferma
            alert(`Offerta accettata! L'annuncio è stato contrassegnato come venduto e l'ordine è stato creato per l'acquirente.`)

            // Rimuovi l'annuncio dalla lista degli annunci attivi
            setActiveAds(activeAds.filter(ad => ad.id !== adId))

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
                </div>
            </motion.section>
            <section className="py-16">
                <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {activeAds.map((ad) => (
                        <div key={ad.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <img src={ad.image} alt={ad.title} className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-semibold">{ad.title}</h3>
                                <p className="text-lg font-bold text-[#41978F]">{ad.price} €</p>
                                <p className="text-sm text-gray-600">{ad.description}</p>
                                {ad.highestOffer ? (
                                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                        <p>
                                            <strong>Offerta più alta:</strong> {ad.highestOffer.amount} €
                                        </p>
                                        <p>
                                            <strong>Data:</strong> {ad.highestOffer.createdAt.toLocaleString()}
                                        </p>
                                        <button
                                            onClick={() => ad.highestOffer !== undefined && ad.highestOffer !== null ? handleAcceptOffer(ad.id, ad.highestOffer) : null}
                                            className="bg-green-500 text-white px-4 py-2 rounded mt-4"
                                            disabled={ad.highestOffer === undefined || ad.highestOffer === null}
                                        >
                                            Accetta Offerta
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 mt-4">Nessuna offerta ricevuta.</p>
                                )}
                            </div>
                        </div>
                    ))}
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