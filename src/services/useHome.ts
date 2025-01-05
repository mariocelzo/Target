'use client';
import { useState, useEffect } from 'react';
import { auth } from '@/data/firebase';
import { fetchUserProducts, fetchUnreadMessages, fetchUserImage } from '@/data/userRepository';
import { fetchProducts } from '@/data/productRepository';

// Tipo prodotto
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    sold: boolean;
}

// Tipo utente (se vuoi aggiungere altri campi, puoi estendere)
interface User {
    uid: string;
    email: string;
    displayName?: string;
}

export function useHome() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Stato utente e dati correlati
    const [user, setUser] = useState<User | null>(null);
    const [userImage, setUserImage] = useState<string | null>(null);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

    // Prodotti dell’utente
    const [userProducts, setUserProducts] = useState<Product[]>([]);

    // Gestione modale prodotto (esempio)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Effetto che “ascolta” l’autenticazione Firebase
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                const userId = currentUser.uid;

                setUser({
                    uid: userId,
                    email: currentUser.email || '',
                    displayName: currentUser.displayName || '',
                });

                try {
                    // Se fetchUnreadMessages o fetchUserImage non esistono,
                    // adattali di conseguenza o rimuovili.
                    const [imgUrl, userProds, unreadCount] = await Promise.all([
                        fetchUserImage(userId),
                        fetchUserProducts(userId),
                        fetchUnreadMessages(userId),
                    ]);

                    setUserImage(imgUrl ?? null);
                    setUserProducts(userProds ?? []);
                    setUnreadMessagesCount(unreadCount ?? 0);
                } catch (error) {
                    console.error('Errore durante il fetch dei dati utente:', error);
                }
            } else {
                // Se non c’è utente loggato, resetta gli stati
                setUser(null);
                setUserImage(null);
                setUserProducts([]);
                setUnreadMessagesCount(0);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Funzione di logout
    const handleLogout = async () => {
        try {
            await auth.signOut();
            setUser(null);
            setUserImage(null);
            setUserProducts([]);
            setUnreadMessagesCount(0);
        } catch (error) {
            console.error('Errore durante il logout:', error);
        }
    };

    // Gestione della ricerca prodotti
    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setIsLoading(true);

        try {
            const results = await fetchProducts(e.target.value);
            setSearchResults(results);
        } catch (error) {
            console.error('Errore durante la ricerca dei prodotti:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Esempio di submit di ricerca
    const handleSearch = () => {
        console.log('Perform search:', searchQuery);
    };

    // Apertura/chiusura dettagli di un prodotto (se ti serve)
    const openProductDetails = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeProductDetails = () => {
        setSelectedProduct(null);
        setIsModalOpen(false);
    };

    // Ritorno di tutti i dati/stati/funzioni che servono all’esterno
    return {
        user,
        userImage,
        unreadMessagesCount,
        userProducts,
        searchQuery,
        searchResults,
        isLoading,
        selectedProduct,
        isModalOpen,
        handleLogout,
        handleSearchChange,
        handleSearch,
        openProductDetails,
        closeProductDetails,
    };
}