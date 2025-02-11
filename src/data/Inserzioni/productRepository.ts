import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    addDoc,
    deleteDoc,
    serverTimestamp,
    DocumentSnapshot,
    QuerySnapshot,
    DocumentReference,
} from 'firebase/firestore';

import { db } from '../firebase';

// Dati minimi di un prodotto salvato in Firestore
export interface ProductData {
    name: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    userId: string;
    image: string; // Immagine in formato base64 o URL (o link)
    createdAt: Date;
    sold: boolean;
}

// Interfaccia più completa che include anche l'id del documento
// (utile se in productService devi comporre l'oggetto "finale" del prodotto)
export interface Product extends ProductData {
    id: string;
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

/* ------------------------------------------------------------------
   NUOVE FUNZIONI
   (fetch del singolo prodotto, gestione offerte, gestione chat)
   ------------------------------------------------------------------ */

/**
 * Recupera un singolo prodotto dal suo ID.
 * Ritorna un DocumentSnapshot (il tuo service potrà fare .exists() e .data()).
 */
export async function fetchProductById(productId: string): Promise<DocumentSnapshot> {
    const docRef = doc(db, 'products', productId);
    return await getDoc(docRef);
}

/**
 * Recupera i dati utente da Firestore dato un userId.
 * Ritorna un DocumentSnapshot.
 */
export async function fetchUserById(userId: string): Promise<DocumentSnapshot> {
    const userRef = doc(db, 'users', userId);
    return await getDoc(userRef);
}

/**
 * Recupera tutte le offerte per uno specifico prodotto.
 * Ritorna un QuerySnapshot (il tuo service potrà ciclare .docs).
 */
export async function fetchOffersByProductId(productId: string): Promise<QuerySnapshot> {
    const offersRef = collection(db, 'offers');
    const qOffers = query(offersRef, where('productId', '==', productId));
    return await getDocs(qOffers);
}

/**
 * Aggiunge una nuova offerta (ad es. con `amount` che indica il valore dell'offerta).
 */
export async function addOffer(productId: string, buyerId: string, amount: number): Promise<void> {
    const offersRef = collection(db, 'offers');
    await addDoc(offersRef, {
        productId,
        buyerId,
        amount,
        createdAt: serverTimestamp(),
    });
}

/**
 * Elimina TUTTE le offerte di un dato utente per un determinato prodotto.
 */
export async function deleteOffers(productId: string, buyerId: string): Promise<void> {
    const offersRef = collection(db, 'offers');
    const qOffers = query(
        offersRef,
        where('productId', '==', productId),
        where('buyerId', '==', buyerId)
    );
    const snap = await getDocs(qOffers);

    const deletions = snap.docs.map((offerDoc) => deleteDoc(offerDoc.ref));
    await Promise.all(deletions);
}

/**
 * Cerca una chat esistente tra buyer e seller per un prodotto.
 * Ritorna un QuerySnapshot (potresti avere 0 o più documenti).
 */
export async function findChat(
    productId: string,
    buyerId: string,
    sellerId: string
): Promise<QuerySnapshot> {
    const chatsRef = collection(db, 'chats');
    const qChats = query(
        chatsRef,
        where('productId', '==', productId),
        where('buyerId', '==', buyerId),
        where('sellerId', '==', sellerId)
    );
    return await getDocs(qChats);
}

/**
 * Crea una nuova chat.
 * Ritorna un DocumentReference (riferimento al documento creato).
 */
export async function createChat(
    productId: string,
    buyerId: string,
    sellerId: string
): Promise<DocumentReference> {
    const chatsRef = collection(db, 'chats');
    return await addDoc(chatsRef, {
        productId,
        buyerId,
        sellerId,
        messages: [],
        createdAt: serverTimestamp(),
    });
}