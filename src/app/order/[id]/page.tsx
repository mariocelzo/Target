'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { getDoc, doc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    sold: boolean; // Campo `sold` per indicare se il prodotto è venduto
}

export default function OrderPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, loadingUser] = useAuthState(auth);
    const router = useRouter();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        phone: '',
    });

    useEffect(() => {
        if (!id) return;

        const fetchProductDetails = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, 'products', String(id));
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const productData: Product = {
                        id: docSnap.id,
                        name: data.name || '',
                        description: data.description || '',
                        price: data.price || 0,
                        category: data.category || '',
                        image: data.image || '',
                        sold: data.sold || false, // Gestiamo il campo sold
                    };
                    setProduct(productData);
                    setError(null);
                } else {
                    setError('Prodotto non trovato');
                }
            } catch (error) {
                setError('Errore nel recupero dei dettagli del prodotto');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleOrderSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (loadingUser) {
            alert('Caricamento in corso...');
            return;
        }

        if (!user) {
            alert('Devi essere autenticato per completare l\'acquisto.');
            return;
        }

        if (!product) {
            alert('Prodotto non disponibile.');
            return;
        }

        // Aggiungi un controllo per evitare che `sold` sia undefined
        if (product.sold) {
            alert('Questo prodotto è già stato venduto.');
            return;
        }

        // Crea un ordine con i dati
        const orderDetails = {
            productId: product.id,
            buyerId: user.uid,
            quantity: 1,
            shippingAddress: formData.address,
            phone: formData.phone,
            fullName: formData.fullName,
            createdAt: serverTimestamp(),

        };

        // Log per verificare cosa stiamo cercando di salvare
        console.log('Dati ordine da salvare:', orderDetails);

        try {
            const ordersRef = collection(db, 'orders');
            const orderRef = await addDoc(ordersRef, orderDetails);

            // Una volta salvato l'ordine, aggiorna lo stato del prodotto a "sold" (venduto)
            await updateDoc(doc(db, 'products', product.id), {
                sold: true, // Impostiamo `sold` a true per indicare che il prodotto è venduto
            });

            // Redirigi alla pagina di conferma
            router.push(`/ordereffettuati`);
        } catch (error) {
            console.error('Errore durante la creazione dell\'ordine', error);
            alert('Si è verificato un errore durante l\'ordine.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-2xl text-gray-600">Caricamento del prodotto...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-2xl text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <section className="bg-[#41978F] text-white py-8">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-extrabold mb-3">{product?.name}</h1>
                    <p className="text-md">{product?.category}</p>
                </div>
            </section>

            <section className="container mx-auto py-8 px-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden max-w-2xl mx-auto">
                    <div className="h-64 bg-gray-200 flex items-center justify-center">
                        <img
                            src={product?.image || '/images/placeholder.jpg'}
                            alt={product?.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="text-lg font-bold mb-2">Descrizione</h3>
                        <p className="text-sm text-gray-600 mb-4">{product?.description}</p>
                        <p className="text-xl text-gray-800 font-bold">€ {product?.price}</p>

                        <form onSubmit={handleOrderSubmit} className="mt-6">
                            <div className="mb-4">
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Indirizzo di Spedizione
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    id="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Numero di Telefono
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none"
                            >
                                Completa l'acquisto
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
