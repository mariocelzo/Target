'use client'

import { useState, useEffect } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { onAuthStateChanged, User } from 'firebase/auth'

// Funzione per convertire il file immagine in base64
function convertToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function Sell() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [category, setCategory] = useState('')
    const [image, setImage] = useState<File | null>(null)  // Nuovo stato per l'immagine
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
        })
        return () => unsubscribe()
    }, [])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name || !description || !price || !category || !user || !image) {
            alert('Tutti i campi sono obbligatori e devi essere loggato')
            return
        }

        setLoading(true)

        try {
            // Converti l'immagine in base64
            const base64Image = await convertToBase64(image);

            // Aggiungi il prodotto alla collezione 'products' di Firestore, includendo l'immagine in base64
            await addDoc(collection(db, 'products'), {
                name,
                description,
                price,
                category,
                userId: user.uid,
                image: base64Image,  // Salva l'immagine come base64
                createdAt: new Date(),
                sold: false,  // Inizializza 'sold' a false
            })

            alert('Oggetto inserito con successo!')
            router.push('/') // Redirige alla homepage
        } catch (error) {
            console.error('Errore durante l\'inserimento dell\'oggetto:', error)
            alert('Si è verificato un errore. Riprova più tardi.')
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
                <h1 className="text-3xl font-extrabold mb-6">Per vendere, devi essere loggato</h1>
                <p className="text-lg mb-6">Accedi per poter vendere i tuoi oggetti su Target Marketplace.</p>
                <Link href="/login" className="py-2 px-4 bg-[#C4333B] text-white rounded-full">Accedi</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <header className="bg-[#C4333B] text-white py-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="text-3xl font-extrabold">Target Marketplace</Link>
                    <nav>
                        <ul className="flex space-x-6 text-lg">
                            <li><Link href="/" className="hover:text-gray-200">Home</Link></li>
                            <li><Link href="/categories" className="hover:text-gray-200">Categorie</Link></li>
                            <li><Link href="/sell" className="hover:text-gray-200">Vendi</Link></li>
                            <li><Link href="/about" className="hover:text-gray-200">Chi Siamo</Link></li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* Sell Form Section */}
            <section className="bg-[#41978F] text-white py-20">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-extrabold mb-6">Vendi il Tuo Oggetto</h1>
                    <p className="text-lg mb-8">Compila il modulo per vendere il tuo oggetto su Target Marketplace.</p>

                    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                        <div className="space-y-4">
                            <label htmlFor="name" className="block text-lg">Nome Oggetto</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-4 rounded-full text-black shadow-lg focus:outline-none"
                                placeholder="Es. Smartphone"
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <label htmlFor="description" className="block text-lg">Descrizione</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-4 rounded-lg text-black shadow-lg focus:outline-none"
                                placeholder="Descrivi l'oggetto"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <label htmlFor="price" className="block text-lg">Prezzo (€)</label>
                            <input
                                id="price"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full p-4 rounded-full text-black shadow-lg focus:outline-none"
                                placeholder="Es. 100"
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <label htmlFor="category" className="block text-lg">Categoria</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-4 rounded-full text-black shadow-lg focus:outline-none"
                                required
                            >
                                <option value="">Seleziona una categoria</option>
                                <option value="Elettronica">Elettronica</option>
                                <option value="Moda">Moda</option>
                                <option value="Arredamento">Arredamento</option>
                                <option value="Giocattoli">Giocattoli</option>
                            </select>
                        </div>

                        {/* Nuovo campo per caricare l'immagine */}
                        <div className="space-y-4">
                            <label htmlFor="image" className="block text-lg">Immagine dell'oggetto</label>
                            <input
                                id="image"
                                type="file"
                                onChange={handleImageChange}
                                className="w-full p-4 rounded-full text-black shadow-lg focus:outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-[#C4333B] text-white font-bold rounded-full"
                            disabled={loading}
                        >
                            {loading ? 'Caricamento...' : 'Vendi il Tuo Oggetto'}
                        </button>
                    </form>
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
