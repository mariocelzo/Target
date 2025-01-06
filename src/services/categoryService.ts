import { db } from '@/data/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';




export const fetchProductsmoda = async (userId: string) => {
    const products: any[] = [];
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

            if (productData.userId !== userId) {
                const userDocRef = doc(db, 'users', productData.userId);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : undefined;
                products.push({ id: productId, ...productData, user: userData });
            }
        }
    } catch (error) {
        console.error('Errore nel recupero dei prodotti:', error);
    }
    console.log('Fetched products:', products); // Aggiungi questo per debug
    return products;
};
export const fetchProducts = async (userId: string) => {
    const products: any[] = [];
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

            if (productData.userId !== userId) {
                const userDocRef = doc(db, 'users', productData.userId);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : undefined;
                products.push({ id: productId, ...productData, user: userData });
            }
        }
    } catch (error) {
        console.error('Errore nel recupero dei prodotti:', error);
    }
    return products;
};

export const fetchProductsauto = async (userId: string) => {
    const products: any[] = [];
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

            if (productData.userId !== userId) {
                const userDocRef = doc(db, 'users', productData.userId);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : undefined;
                products.push({ id: productId, ...productData, user: userData });
            }
        }
    } catch (error) {
        console.error('Errore nel recupero dei prodotti:', error);
    }
    console.log('Fetched products:', products); // Aggiungi questo per debug
    return products;
};
export const fetchProductsele = async (userId: string) => {
    const products: any[] = [];
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

            if (productData.userId !== userId) {
                const userDocRef = doc(db, 'users', productData.userId);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : undefined;
                products.push({ id: productId, ...productData, user: userData });
            }
        }
    } catch (error) {
        console.error('Errore nel recupero dei prodotti:', error);
    }
    console.log('Fetched products:', products); // Aggiungi questo per debug
    return products;



};



