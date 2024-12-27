'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Product {
    id: string
    name: string
    category: string
    price: number
    description: string
    image?: string
    userId?: string
}

interface Seller {
    fullName: string
    email?: string
}

export default function ProductDetailsPage() {
    const { id } = useParams() as { id: string }
    const [product, setProduct] = useState<Product | null>(null)
    const [seller, setSeller] = useState<Seller | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchProductAndSeller = async () => {
            if (!id) return

            try {
                setIsLoading(true)

                // Recupera il prodotto
                const productRef = doc(db, 'products', id)
                const productSnap = await getDoc(productRef)

                if (productSnap.exists()) {
                    const productData = { id: productSnap.id, ...productSnap.data() } as Product
                    setProduct(productData)

                    // Recupera i dati del venditore
                    if (productData.userId) {
                        const userRef = doc(db, 'users', productData.userId)
                        const userSnap = await getDoc(userRef)

                        if (userSnap.exists()) {
                            setSeller(userSnap.data() as Seller)
                        } else {
                            console.warn('Venditore non trovato per userId:', productData.userId)
                        }
                    }
                } else {
                    console.error('Prodotto non trovato!')
                    router.push('/404')
                }
            } catch (error) {
                console.error('Errore nel recupero dei dettagli:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProductAndSeller()
    }, [id, router])

    // Stato di caricamento
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-2xl text-gray-600">Caricamento dettagli prodotto...</p>
            </div>
        )
    }

    // Stato prodotto non trovato
    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-2xl text-red-600">Prodotto non trovato!</p>
            </div>
        )
    }

    // Stato principale
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-[#41978F] text-white py-12">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl font-extrabold mb-2">{product.name}</h1>
                    <p className="text-lg">Scopri ogni dettaglio su questo prodotto unico</p>
                </div>
            </section>

            {/* Product Details */}
            <section className="container mx-auto py-12 px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Immagine Prodotto */}
                <div className="w-full flex justify-center">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full max-w-lg rounded-lg shadow-lg object-cover"
                        />
                    ) : (
                        <div className="w-full max-w-lg h-64 bg-gray-200 flex items-center justify-center rounded-lg shadow-md">
                            <span className="text-gray-400">Immagine non disponibile</span>
                        </div>
                    )}
                </div>

                {/* Dettagli Prodotto */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800">{product.name}</h2>
                    <p className="text-lg text-gray-600"><strong>Categoria:</strong> {product.category}</p>
                    <p className="text-2xl font-bold text-[#C4333B]">€{product.price}</p>
                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                    {seller ? (
                        <div className="mt-4">
                            <p className="text-lg text-gray-600">
                                <strong>Venditore:</strong> {seller.fullName || 'Nome non disponibile'}
                            </p>
                        </div>
                    ) : (
                        <p className="text-lg text-gray-600">Caricamento informazioni venditore...</p>
                    )}
                    <button
                        onClick={() => router.push('/')}
                        className="mt-6 bg-[#C4333B] text-white px-6 py-3 rounded-md font-medium hover:bg-[#A12229] transition duration-300"
                    >
                        Torna alla Home
                    </button>
                </div>
            </section>

            {/* Informazioni Extra */}
            <section className="bg-gray-100 py-8">
                <div className="container mx-auto text-center">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Perché scegliere i nostri prodotti?</h3>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Offriamo solo prodotti di alta qualità, selezionati con cura e garantiti per soddisfare le esigenze dei nostri clienti.
                    </p>
                </div>
            </section>
        </div>
    )
}
