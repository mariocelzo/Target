'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/services/sellService';
import FormInput from '@/components/FormInput';
import ImageUploader from '@/components/ImageUploader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner'; // Importa il componente
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/data/firebase';

/** Struttura per l'alert personalizzato */
interface AlertData {
    type: '' | 'success' | 'error';
    message: string;
}

export default function Sell() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [condition, setCondition] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false); // Stato di caricamento
    const [userId, setUserId] = useState<string | null>(null);

    // Stato per l'alert personalizzato
    const [alertData, setAlertData] = useState<AlertData>({
        type: '',
        message: '',
    });

    const router = useRouter();

    // Recupera l'userId dell'utente autenticato
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
                setAlertData({
                    type: 'error',
                    message: "Devi effettuare l'accesso per caricare un articolo.",
                });
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    const closeAlert = () => {
        setAlertData({ type: '', message: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !description || !price || !category || !condition || !image || !userId) {
            setAlertData({
                type: 'error',
                message: 'Tutti i campi sono obbligatori.',
            });
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

            setAlertData({
                type: 'success',
                message: 'Oggetto inserito con successo!',
            });

            setTimeout(() => {
                router.push('/');
            }, 1500);
        } catch (error) {
            console.error('Errore durante l\'inserimento:', error);
            setAlertData({
                type: 'error',
                message: 'Si è verificato un errore. Riprova più tardi.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Mostra il caricamento globale quando `loading` è attivo
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#41978F] to-[#2C6E68] flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <>
            <Header />

            {/* Alert personalizzato */}
            {alertData.type !== '' && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white max-w-sm w-full rounded-lg shadow-xl p-6 relative">
                        <button
                            onClick={closeAlert}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                        >
                            ✕
                        </button>

                        <div className="flex justify-center mb-4">
                            <img
                                src="/logoNosfondo.png"
                                alt="Logo"
                                className="h-16 w-auto"
                            />
                        </div>

                        <p
                            className={`text-center text-lg font-semibold ${
                                alertData.type === 'success' ? 'text-[#41978F]' : 'text-[#C4333B]'
                            }`}
                        >
                            {alertData.message}
                        </p>

                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={closeAlert}
                                className={`px-6 py-2 rounded-lg font-bold 
                                    ${
                                    alertData.type === 'success'
                                        ? 'bg-[#41978F] hover:bg-[#2C6E68]'
                                        : 'bg-[#C4333B] hover:bg-[#a82c30]'
                                }
                                    text-white transition duration-300
                                `}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sezione principale con sfondo originale */}
            <section className="bg-gradient-to-br from-[#41978F] to-[#2C6E68] py-16 px-4">
                <div className="container mx-auto max-w-6xl bg-white rounded-xl shadow-2xl p-10">
                    <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
                        Vendi il Tuo Oggetto
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Sezione sinistra: Uploader Immagini */}
                        <div className="flex flex-col items-center bg-gray-100 p-8 rounded-lg shadow-xl">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">
                                Carica un&#39;immagine
                            </h2>
                            <ImageUploader
                                image={image}
                                onImageChange={(e) => setImage(e.target.files?.[0] || null)}
                                onRemoveImage={() => setImage(null)}
                            />
                            <p className="text-sm text-gray-500 mt-3 italic">
                                Accetta immagini in formato PNG o JPG (max 2MB)
                            </p>
                        </div>

                        {/* Sezione destra: Campi del form */}
                        <div className="bg-gray-100 p-8 rounded-lg shadow-xl">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <FormInput
                                    id="name"
                                    label="Nome Oggetto"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Es. Smartphone"
                                    required
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

                                <div className="space-y-4">
                                    <label
                                        htmlFor="category"
                                        className="block text-lg font-medium text-gray-700"
                                    >
                                        Categoria
                                    </label>
                                    <select
                                        id="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41978F] focus:outline-none text-gray-900"
                                        required
                                    >
                                        <option value="" disabled>
                                            Seleziona una categoria
                                        </option>
                                        <option value="Auto e Moto">Auto e Moto</option>
                                        <option value="Moda">Moda</option>
                                        <option value="Elettronica">Elettronica</option>
                                        <option value="Arredamento">Arredamento</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label
                                        htmlFor="condition"
                                        className="block text-lg font-medium text-gray-700"
                                    >
                                        Condizione
                                    </label>
                                    <select
                                        id="condition"
                                        value={condition}
                                        onChange={(e) => setCondition(e.target.value)}
                                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41978F] focus:outline-none text-gray-900"
                                        required
                                    >
                                        <option value="" disabled>
                                            Seleziona una condizione
                                        </option>
                                        <option value="Nuovo">Nuovo</option>
                                        <option value="Usato - Come Nuovo">Usato - Come Nuovo</option>
                                        <option value="Usato">Usato</option>
                                        <option value="Difettoso">Difettoso</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-4 rounded-lg font-bold transition duration-300 ${
                                        loading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-[#C4333B] hover:bg-[#a82c30]'
                                    } text-white`}
                                    disabled={loading}
                                    aria-disabled={loading}
                                >
                                    {loading ? 'Caricamento...' : 'Vendi il Tuo Oggetto'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}