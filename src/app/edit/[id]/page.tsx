'use client'

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

interface Ad {
    name: string
    description: string
    price: string
    category: string
    image?: string
}

export default function EditAd() {
    const router = useRouter()
    const pathname = usePathname()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [id, setId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState<Ad>({
        name: '',
        description: '',
        price: '',
        category: '',
        image: ''
    })
    const [previewImage, setPreviewImage] = useState<string | null>(null)

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
                    const adData = adDoc.data() as Ad
                    setFormData(adData)
                    setPreviewImage(adData.image || null)
                } else {
                    console.error('Annuncio non trovato')
                }
                setLoading(false)
            }
            fetchAd()
        }
    }, [id])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                setPreviewImage(base64String)
                setFormData(prev => ({ ...prev, image: base64String }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name|| !formData.description || !formData.price || !formData.category) {
            alert('Tutti i campi sono obbligatori')
            return
        }

        try {
            const adRef = doc(db, 'products', id as string)
            await updateDoc(adRef, { ...formData })

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
                    {/* Immagine */}
                    <div className="mb-6">
                        <div
                            className="relative w-full h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:opacity-90"
                            onClick={handleImageClick}
                        >
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Anteprima Immagine"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
                                    Clicca per aggiungere/modificare un&#39;immagine
                                </div>
                            )}
                            {/* Icona di modifica */}
                            <div className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow-md">
                                🖍️
                            </div>
                        </div>
                        {/* Testo esplicativo */}
                        <p className="text-sm text-center text-gray-500 mt-2">
                            Clicca sull&#39;immagine per modificarla
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* Titolo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Titolo</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Titolo"
                            required
                            className="w-full p-3 mt-2 border rounded-lg"
                        />
                    </div>

                    {/* Descrizione */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Descrizione</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Descrizione"
                            required
                            rows={4}
                            className="w-full p-3 mt-2 border rounded-lg"
                        />
                    </div>

                    {/* Prezzo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Prezzo</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Prezzo"
                            required
                            className="w-full p-3 mt-2 border rounded-lg"
                        />
                    </div>

                    {/* Categoria */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Categoria</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="Categoria"
                            required
                            className="w-full p-3 mt-2 border rounded-lg"
                        />
                    </div>

                    {/* Pulsante di invio */}
                    <button
                        type="submit"
                        className="w-full py-3 mt-4 bg-[#C4333B] text-white rounded-lg hover:bg-[#A12D33]"
                    >
                        Aggiorna Annuncio
                    </button>
                </form>
            </div>
        </div>
    )
}
