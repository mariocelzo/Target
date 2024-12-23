'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImage, addArticle, getCurrentUser } from '@/lib/firebase';

const Page = () => {
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [shipping, setShipping] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 5) {
            alert('Puoi caricare un massimo di 5 immagini.');
            return;
        }
        setImages(files);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const user = getCurrentUser();
        if (!user) {
            alert('Devi essere autenticato per mettere in vendita un articolo.');
            router.push('/login'); // Reindirizza alla pagina di login
            return;
        }

        if (!description || !price || images.length === 0) {
            alert('Compila tutti i campi obbligatori.');
            setLoading(false);
            return;
        }

        try {
            // Carica le immagini su Firebase Storage
            const imageUrls = await Promise.all(
                images.map((file) => uploadImage(file, user.uid))
            );

            // Salva i dati dell'articolo su Firestore
            const articleData = {
                userId: user.uid,
                description,
                price: parseFloat(price),
                shipping,
                images: imageUrls,
                createdAt: new Date(),
            };

            await addArticle(articleData);
            alert('Articolo aggiunto con successo!');
            router.push('/profile'); // Reindirizza al profilo dell'utente
        } catch (error) {
            console.error('Errore durante l\'aggiunta dell\'articolo:', error);
            alert('Si è verificato un errore. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-[#C4333B] text-white p-4">
                <h1 className="text-2xl font-bold text-center">Vendi un Articolo</h1>
            </header>
            <main className="py-16">
                <form className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow" onSubmit={handleSubmit}>
                    <label className="block mb-4">
                        Descrizione
                        <textarea
                            className="w-full border p-2 mt-1"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </label>
                    <label className="block mb-4">
                        Prezzo (€)
                        <input
                            type="number"
                            step="0.01"
                            className="w-full border p-2 mt-1"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </label>
                    <label className="block mb-4">
                        <input
                            type="checkbox"
                            checked={shipping}
                            onChange={(e) => setShipping(e.target.checked)}
                        />
                        Disponibile alla spedizione
                    </label>
                    <label className="block mb-4">
                        Foto (massimo 5)
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="mt-1"
                        />
                    </label>
                    <button
                        type="submit"
                        className="bg-[#C4333B] text-white px-4 py-2 rounded hover:bg-red-600"
                        disabled={loading}
                    >
                        {loading ? 'Caricamento...' : 'Metti in vendita'}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default Page;