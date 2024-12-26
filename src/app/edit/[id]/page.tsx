'use client'

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

export default function EditAd() {
    const router = useRouter()
    const pathname = usePathname()
    const [id, setId] = useState<string | null>(null)
    const [ad, setAd] = useState<Record<string, any> | null>(null)
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: ''
    })

    // Estrai l'ID dall'URL
    useEffect(() => {
        if (typeof window !== 'undefined' && pathname) {
            const pathParts = pathname.split('/')
            setId(pathParts[pathParts.length - 1] || null)
        }
    }, [pathname])

    // Carica i dati dell'annuncio da Firestore
    useEffect(() => {
        if (id) {
            const fetchAd = async () => {
                const adRef = doc(db, 'products', id)
                const adDoc = await getDoc(adRef)
                if (adDoc.exists()) {
                    const adData = adDoc.data() as Record<string, any>
                    setAd(adData)
                    setFormData({
                        title: adData.title || '',
                        description: adData.description || '',
                        price: adData.price || '',
                        category: adData.category || ''
                    })
                } else {
                    console.error('Annuncio non trovato')
                }
                setLoading(false)
            }
            fetchAd()
        }
    }, [id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title || !formData.description || !formData.price || !formData.category) {
            alert('Tutti i campi sono obbligatori')
            return
        }

        try {
            const adRef = doc(db, 'products', id as string)
            await updateDoc(adRef, formData)

            // Reindirizza alla pagina dell'annuncio aggiornato
            router.push('/user-active-ads')
        } catch (error) {
            console.error('Errore durante l\'aggiornamento dell\'annuncio:', error)
            alert('Si è verificato un errore. Riprova più tardi.')
        }
    }

    if (loading) {
        return <div>Caricamento...</div>
    }

    return (
        <div className="p-8 bg-[#41978F] min-h-screen">
            <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-semibold mb-6 text-center">Modifica Annuncio</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Titolo</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Titolo"
                            required
                            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#41978F]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Descrizione</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Descrizione"
                            required
                            rows={4}
                            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#41978F]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Prezzo</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Prezzo"
                            required
                            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#41978F]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Categoria</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="Categoria"
                            required
                            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#41978F]"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 mt-4 bg-[#C4333B] text-white rounded-lg shadow-lg hover:bg-[#A12D33] focus:outline-none"
                    >
                        Aggiorna Annuncio
                    </button>
                </form>
            </div>
        </div>
    )
}


