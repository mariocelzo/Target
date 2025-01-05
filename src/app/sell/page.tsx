'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/services/sellService';
import FormInput from '@/components/FormInput';
import ImageUploader from '@/components/ImageUploader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/data/firebase';

export default function Sell() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [condition, setCondition] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const router = useRouter();

    // Recupera l'userId dell'utente autenticato
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
                alert('Devi effettuare l\'accesso per caricare un articolo.');
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !description || !price || !category || !condition || !image || !userId) {
            alert('Tutti i campi sono obbligatori.');
            return;
        }

        setLoading(true);

        try {
            await createProduct(
                {
                    name,
                    description,
                    price: Number(price),
                    category,
                    condition,
                    userId,
                    createdAt: new Date(),
                    sold: false,
                },
                image
            );
            alert('Oggetto inserito con successo!');
            router.push('/'); // Vai alla home page
        } catch (error) {
            console.error('Errore durante l\'inserimento:', error);
            alert('Si è verificato un errore. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <section className="bg-[#41978F] text-white py-16 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-8">Vendi il Tuo Oggetto</h1>
                    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                        <FormInput
                            id="name"
                            label="Nome Oggetto"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Es. Smartphone"
                            required
                        />
                        <ImageUploader
                            image={image}
                            onImageChange={(e) => setImage(e.target.files?.[0] || null)}
                            onRemoveImage={() => setImage(null)}
                        />
                        <FormInput
                            id="description"
                            label="Descrizione"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descrivi l'oggetto"
                            type="textarea"
                            required
                        />
                        <FormInput
                            id="price"
                            label="Prezzo (€)"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Es. 100"
                            type="number"
                            required
                        />
                        <div className="space-y-2">
                            <label htmlFor="category" className="block text-lg font-medium text-gray-800">
                                Categoria
                            </label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41978F] focus:outline-none text-gray-900"
                                required
                            >
                                <option value="" disabled>Seleziona una categoria</option>
                                <option value="Auto e Moto">Auto e Moto</option>
                                <option value="Moda">Moda</option>
                                <option value="Elettronica">Elettronica</option>
                                <option value="Arredamento">Arredamento</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="condition" className="block text-lg font-medium text-gray-800">
                                Condizione
                            </label>
                            <select
                                id="condition"
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41978F] focus:outline-none text-gray-900"
                                required
                            >
                                <option value="" disabled>Seleziona una condizione</option>
                                <option value="Nuovo">Nuovo</option>
                                <option value="Usato - Come Nuovo">Usato - Come Nuovo</option>
                                <option value="Usato">Usato</option>
                                <option value="Difettoso">Difettoso</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-4 rounded-full font-bold transition duration-300 ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#C4333B] hover:bg-[#a82c30]'
                            }`}
                            disabled={loading}
                            aria-disabled={loading}
                        >
                            {loading ? 'Caricamento...' : 'Vendi il Tuo Oggetto'}
                        </button>
                    </form>
                </div>
            </section>
            <Footer />
        </>
    );
}