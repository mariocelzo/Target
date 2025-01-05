import { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { fetchUserProducts, fetchUnreadMessages, fetchUserImage } from '@/data/userRepository';
import { fetchProducts } from '@/data/productRepository';
import { auth } from '@/data/firebase';

export function useHome() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [userImage, setUserImage] = useState<string | null>(null);
    const [userProducts, setUserProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setUserImage(await fetchUserImage(currentUser.uid));
                setUserProducts(await fetchUserProducts(currentUser.uid));
            } else {
                setUser(null);
            }
        });

        return unsubscribe;
    }, []);

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setIsLoading(true);

        const results = await fetchProducts(e.target.value);
        setSearchResults(results);

        setIsLoading(false);
    };

    const handleSearch = () => {
        console.log('Perform search:', searchQuery);
    };

    const openProductDetails = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeProductDetails = () => {
        setSelectedProduct(null);
        setIsModalOpen(false);
    };

    return {
        user,
        userImage,
        searchQuery,
        searchResults,
        isLoading,
        handleSearchChange,
        handleSearch,
        userProducts,
        openProductDetails,
        closeProductDetails,
        selectedProduct,
        isModalOpen,
    };
}