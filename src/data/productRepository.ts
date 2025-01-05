import { db } from './firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

// Tipo per rappresentare i dati di un prodotto
export interface ProductData {
    name: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    userId: string;
    image: string; // Immagine in formato base64 o URL
    createdAt: Date;
    sold: boolean;
}

/**
 * Funzione per cercare prodotti in base a una query di ricerca.
 */
export async function fetchProducts(searchQuery: string): Promise<ProductData[]> {
    const q = query(
        collection(db, 'products'),
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as unknown as ProductData[];
}

/**
 * Funzione per aggiungere un nuovo prodotto.
 */
export async function addProduct(productData: ProductData): Promise<void> {
    await addDoc(collection(db, 'products'), productData);
}