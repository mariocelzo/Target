'use client'

import { useState, useRef } from 'react'
import { Ad } from '@/services/adEditService'
import { handleImageChange, handleSubmit } from '@/services/adEditService'

interface EditAdProps {
    initialData: Ad | null
    onSubmit: (formData: Ad) => void
    loading: boolean
}

export default function EditAd({ initialData, onSubmit, loading }: EditAdProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [formData, setFormData] = useState<Ad>(initialData || {
        name: '',
        description: '',
        price: '',
        category: '',
        image: ''
    })
    const [previewImage, setPreviewImage] = useState<string | null>(formData.image || null)

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))  // Usa il name corretto
    }

    if (loading) {
        return <div>Caricamento...</div>
    }

    return (
        <div className="p-8 bg-[#41978F] min-h-screen">
            <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-semibold mb-6 text-center">Modifica Annuncio</h1>
                <form onSubmit={(e) => handleSubmit(e, formData, onSubmit)} className="space-y-6">
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
                            <div className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow-md">
                                🖍️
                            </div>
                        </div>
                        <p className="text-sm text-center text-gray-500 mt-2">Clicca sull&#39;immagine per modificarla</p>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => handleImageChange(e, setPreviewImage, setFormData)}
                        />
                    </div>

                    {/* Titolo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Titolo</label>
                        <input
                            type="text"
                            name="name"
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
