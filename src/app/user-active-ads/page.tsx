'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import Link from 'next/link'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid'
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface Ad {
    id: string
    title: string
    price: string
    image: string
    sold: boolean
}

export default function UserActiveAds() {
    const [user, setUser] = useState<import('firebase/auth').User | null>(null)
    const [activeAds, setActiveAds] = useState<Ad[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [showTooltip, setShowTooltip] = useState<boolean>(false) // Tooltip per i dettagli ordine

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user)
                const adsRef = collection(db, 'products')
                const q = query(adsRef, where('userId', '==', user.uid))
                const querySnapshot = await getDocs(q)
                const ads: Ad[] = querySnapshot.docs.map(doc => {
                    const data = doc.data()
                    return {
                        id: doc.id,
                        title: data.title,
                        price: data.price,
                        image: data.image || '/placeholder-image.jpg', // Immagine di fallback
                        sold: data.sold || false,
                    }
                })
                setActiveAds(ads)
                setLoading(false)
            } else {
                setUser(null)
                setActiveAds([])
                setLoading(false)
            }
        })

        return () => unsubscribe()
    }, [])

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

    if (loading) {
        return <div>Caricamento...</div>
    }

    if (!user) {
        return (
            <div>
                <h1>Accedi per visualizzare i tuoi annunci</h1>
                <Link href="/login">Accedi</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header/>

            <section className="bg-[#41978F] text-white py-20">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl font-extrabold mb-6">I tuoi Annunci Attivi</h1>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto text-center">
                    {activeAds.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {activeAds.map((ad) => (
                                <div
                                    key={ad.id}
                                    className={`bg-white shadow-md rounded-lg p-6 ${ad.sold ? 'bg-red-500 text-white cursor-not-allowed' : ''}`}
                                >
                                    {!ad.sold ? (
                                        <Link href={`/edit/${ad.id}`} className="w-full">
                                            <img
                                                src={ad.image}
                                                alt={ad.title}
                                                className="w-full h-48 object-cover rounded-lg mb-4"
                                                onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')}
                                            />
                                            <h3 className="text-xl font-bold mb-2 text-black">{ad.title}</h3>
                                            <p className="text-gray-500">{ad.price} €</p>
                                        </Link>
                                    ) : (
                                        <div>
                                            <img
                                                src={ad.image}
                                                alt={ad.title}
                                                className="w-full h-48 object-cover rounded-lg mb-4"
                                                onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')}
                                            />
                                            <h3 className="text-xl font-bold mb-2 text-black">{ad.title}</h3>
                                            <p className="text-black">{ad.price} €</p>
                                            <p className="text-red-600 mt-2">Questo annuncio è stato venduto.</p>
                                        </div>
                                    )}

                                    <div className="mt-4 flex justify-between items-center">
                                        {/* Azioni (modifica, elimina) solo per annunci non venduti */}
                                        {!ad.sold && (
                                            <>
                                                <Link href={`/edit/${ad.id}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white hover:bg-blue-600">
                                                    <PencilIcon className="w-6 h-6" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(ad.id)}
                                                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white hover:bg-red-600"
                                                >
                                                    <TrashIcon className="w-6 h-6" />
                                                </button>
                                            </>
                                        )}

                                        {/* Pulsante con tre puntini per gli annunci venduti */}
                                        {ad.sold && (
                                            <div
                                                onMouseEnter={() => setShowTooltip(true)}
                                                onMouseLeave={() => setShowTooltip(false)}
                                                className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 text-white hover:bg-gray-700"
                                            >
                                                <EllipsisVerticalIcon className="w-6 h-6" />
                                                {showTooltip && (
                                                    <div className="absolute left-0 top-10 w-64 p-4 bg-white shadow-lg rounded-lg text-black">
                                                        <p><strong>Dettagli Ordine</strong></p>
                                                        <p>ID Prodotto: {ad.id}</p>
                                                        <p>Indirizzo di Spedizione: Piazza Marconi 20, Sarno</p>
                                                        <p>Città: Sarno</p>
                                                        <p>Stato: Italia</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Non hai annunci attivi.</p>
                    )}
                </div>
            </section>

            <Footer/>
        </div>
    )
}
