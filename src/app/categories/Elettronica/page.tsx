'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'

export default function ElectronicsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const q = query(collection(db, 'products'), where('category', '==', 'Elettronica'))
                const querySnapshot = await getDocs(q)
                const productList: any[] = []
                querySnapshot.forEach((doc) => {
                    productList.push({ id: doc.id, ...doc.data() })
                })
                setProducts(productList)
                setIsLoading(false)
            } catch (error) {
                console.error('Errore nel recupero dei prodotti:', error)
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-2xl text-gray-600">Caricamento dei prodotti...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-[#41978F] text-white py-12">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl font-extrabold mb-4">Prodotti Moda</h1>
                    <p className="text-lg">Scopri i migliori articoli tecnologici disponibili</p>
                </div>
            </section>

            {/* Product Grid */}
            <section className="container mx-auto py-12 px-4">
                <h2 className="text-2xl font-bold mb-6 text-center">Esplora i Prodotti</h2>
                {products.length === 0 ? (
                    <p className="text-center text-gray-500">Nessun prodotto trovato nella categoria Moda.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="h-48 bg-gray-200 flex items-center justify-center">
                                    {/* Placeholder per l'immagine del prodotto */}
                                    <img
                                        src={product.image || '/images/placeholder.jpg'}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-bold mb-2">{product.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4 truncate">{product.description}</p>
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="text-white bg-[#C4333B] hover:bg-[#A12229] px-4 py-2 rounded-md text-sm font-medium"
                                    >
                                        Visualizza Dettagli
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
