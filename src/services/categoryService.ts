import { db } from '@/data/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Definizione delle interfacce per i dati dei prodotti e degli utenti
interface User {
    id: string;
    fullName?: string;
    email?: string;
    imageUrl?: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    sold: boolean;
    userId: string;
    imageUrl?: string;
    user?: User;
}

export const fetchProductsmoda = async (userId: string | null): Promise<Product[]> => {
    const products: Product[] = [];
    try {
        const q = query(
            collection(db, 'products'),
            where('category', '==', 'Moda'),
            where('sold', '==', false)
        );

        const querySnapshot = await getDocs(q);

        for (const docSnap of querySnapshot.docs) {
            const productData = docSnap.data();
            const productId = docSnap.id;

            // Only filter by userId if user is authenticated
            if (!userId || productData.userId !== userId) {
                const userDocRef = doc(db, 'users', productData.userId);
                const userDoc = await getDoc(userDocRef);
                const userData: User | undefined = userDoc.exists()
                    ? { id: userDoc.id, ...userDoc.data() }
                    : undefined;

                products.push({ id: productId, ...productData, user: userData } as Product);
            }
        }
    } catch (error) {
        console.error('Errore nel recupero dei prodotti:', error);
    }
    console.log('Fetched products:', products); // Debug
    return products;
};

export const fetchProducts = async (userId: string | null): Promise<Product[]> => {
    const products: Product[] = [];
    try {
        const q = query(
            collection(db, 'products'),
            where('category', '==', 'Arredamento'),
            where('sold', '==', false)
        );

        const querySnapshot = await getDocs(q);

        for (const docSnap of querySnapshot.docs) {
            const productData = docSnap.data();
            const productId = docSnap.id;

            // Only filter by userId if user is authenticated
            if (!userId || productData.userId !== userId) {
                const userDocRef = doc(db, 'users', productData.userId);
                const userDoc = await getDoc(userDocRef);
                const userData: User | undefined = userDoc.exists()
                    ? { id: userDoc.id, ...userDoc.data() }
                    : undefined;

                products.push({ id: productId, ...productData, user: userData } as Product);
            }
        }
    } catch (error) {
        console.error('Errore nel recupero dei prodotti:', error);
    }
    return products;
};

export const fetchProductsauto = async (userId: string | null): Promise<Product[]> => {
    const products: Product[] = [];
    try {
        const q = query(
            collection(db, 'products'),
            where('category', '==', 'Auto e Moto'),
            where('sold', '==', false)
        );

        const querySnapshot = await getDocs(q);

        for (const docSnap of querySnapshot.docs) {
            const productData = docSnap.data();
            const productId = docSnap.id;

            // Only filter by userId if user is authenticated
            if (!userId || productData.userId !== userId) {
                const userDocRef = doc(db, 'users', productData.userId);
                const userDoc = await getDoc(userDocRef);
                const userData: User | undefined = userDoc.exists()
                    ? { id: userDoc.id, ...userDoc.data() }
                    : undefined;

                products.push({ id: productId, ...productData, user: userData } as Product);
            }
        }
    } catch (error) {
        console.error('Errore nel recupero dei prodotti:', error);
    }
    console.log('Fetched products:', products); // Debug
    return products;
};

export const fetchProductsele = async (userId: string | null): Promise<Product[]> => {
    const products: Product[] = [];
    try {
        const q = query(
            collection(db, 'products'),
            where('category', '==', 'Elettronica'),
            where('sold', '==', false)
        );

        const querySnapshot = await getDocs(q);

        for (const docSnap of querySnapshot.docs) {
            const productData = docSnap.data();
            const productId = docSnap.id;

            // Only filter by userId if user is authenticated
            if (!userId || productData.userId !== userId) {
                const userDocRef = doc(db, 'users', productData.userId);
                const userDoc = await getDoc(userDocRef);
                const userData: User | undefined = userDoc.exists()
                    ? { id: userDoc.id, ...userDoc.data() }
                    : undefined;

                products.push({ id: productId, ...productData, user: userData } as Product);
            }
        }
    } catch (error) {
        console.error('Errore nel recupero dei prodotti:', error);
    }
    console.log('Fetched products:', products); // Debug
    return products;
};