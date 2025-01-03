'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'
import { getAuth } from 'firebase/auth'
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function ElectronicsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Recupera l'utente loggato
                const auth = getAuth()
                const user = auth.currentUser
                if (!user) {
                    setIsLoading(false)
                    return
                }

                const q = query(collection(db, 'products'), where('category', '==', 'Moda'))
                const querySnapshot = await getDocs(q)
                const productList: any[] = []

                // Fetch products and their sellers' information
                for (const docSnap of querySnapshot.docs) {
                    const productData = docSnap.data()
                    const productId = docSnap.id

                    // Verifica che il prodotto non sia stato pubblicato dall'utente loggato
                    if (productData.userId !== user.uid) {
                        // Get the user who posted the product (assuming 'userId' is a field in the product)
                        const userDocRef = doc(db, 'users', productData.userId)
                        const userDoc = await getDoc(userDocRef)
                        const userData = userDoc.exists() ? userDoc.data() : null

                        productList.push({ id: productId, ...productData, user: userData })
                    }
                }

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
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-teal-600 to-teal-400 text-white py-12">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl font-extrabold mb-4">Prodotti Arredamento</h1>
                    <p className="text-lg">Scopri i migliori articoli di arredamento disponibili</p>
                </div>
            </section>

            {/* Product List */}
            <section className="container mx-auto py-12 px-6">
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Esplora i Prodotti</h2>
                {products.length === 0 ? (
                    <p className="text-center text-gray-500">Nessun prodotto trovato nella categoria Arredamento.</p>
                ) : (
                    <div className="space-y-6">
                        {products.map((product) => (
                            <Link
                                href={`/products/${product.id}`}
                                key={product.id}
                                className="block bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="flex items-center">
                                    {/* Colonna sinistra: Immagine prodotto */}
                                    <div className="w-1/3 flex items-center justify-center h-48 bg-gray-100 rounded-l-xl">
                                        <img
                                            src={product.image || '/images/placeholder.jpg'}
                                            alt={product.title}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>

                                    {/* Colonna destra: Dettagli prodotto */}
                                    <div className="w-2/3 p-6 flex flex-col space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                                            {product.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {product.description}
                                        </p>
                                        <p className="text-lg font-semibold text-teal-600">
                                            € {product.price}
                                        </p>

                                        {/* Stato "Venduto" */}
                                        {product.sold && (
                                            <p className="text-sm font-semibold text-red-500 uppercase">
                                                Venduto
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
}