'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import Link from 'next/link'

// Definiamo il tipo per un annuncio
interface Ad {
    id: string
    title: string
    price: string
    imageUrl: string
}

export default function UserActiveAds() {
    const [user, setUser] = useState<import('firebase/auth').User | null>(null)
    const [activeAds, setActiveAds] = useState<Ad[]>([]) // Tipo corretto per gli annunci
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user) // Imposta l'utente se loggato
                // Recupera gli annunci attivi dell'utente da Firestore
                const adsRef = collection(db, 'products')
                const q = query(adsRef, where('userId', '==', user.uid)) // Filtro per l'ID utente
                const querySnapshot = await getDocs(q)
                const ads: Ad[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }) as Ad) // Assicurati che i dati siano conformi al tipo Ad
                setActiveAds(ads) // Imposta gli annunci attivi
                setLoading(false)
            } else {
                setUser(null) // Rimuovi l'utente se non è loggato
                setActiveAds([]) // Rimuovi gli annunci
                setLoading(false)
            }
        })

        return () => unsubscribe()
    }, [])

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
            {/* Navbar */}
            <header className="bg-[#C4333B] text-white py-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="text-3xl font-extrabold">
                        Target Marketplace
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-[#41978F] text-white py-20">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl font-extrabold mb-6">I tuoi Annunci Attivi</h1>
                </div>
            </section>

            {/* Active Ads Section */}
            <section className="py-16">
                <div className="container mx-auto text-center">
                    {activeAds.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {activeAds.map((ad) => (
                                <div key={ad.id} className="bg-white shadow-md rounded-lg p-6">
                                    <Link href={`/edit/${ad.id}`}>
                                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                                        <h3 className="text-xl font-bold mb-2">{ad.title}</h3>
                                        <p className="text-gray-500">{ad.price} €</p>
                                    </Link>
                                    {/* Aggiungi il link per la modifica */}
                                    <Link href={`/edit/${ad.id}`} className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg">
                                        Modifica
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Non hai annunci attivi.</p>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#41978F] text-white py-8">
                <div className="container mx-auto text-center">
                    <p className="text-lg">&copy; 2024 Target Marketplace. Tutti i diritti riservati.</p>
                    <div className="mt-4">
                        <ul className="flex justify-center space-x-6">
                            <li><Link href="/privacy-policy" className="hover:text-gray-200">Privacy Policy</Link></li>
                            <li><Link href="/terms-of-service" className="hover:text-gray-200">Termini di Servizio</Link></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    )
}
