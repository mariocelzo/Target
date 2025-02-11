// src/services/productService.ts

import { Timestamp } from 'firebase/firestore';
import {
    fetchProductById,
    fetchUserById,
    fetchOffersByProductId,
    addOffer,
    deleteOffers,
    findChat,
    createChat,
    Product, // <-- Tipo che include 'condition' e 'sold'
} from '@/data/Inserzioni/productRepository';

export interface ProductDetail {
    product: Product | null;
    sellerName: string | null;
    sellerImage: string | null;
    maxOffer: number | null;
    userOffer: number | null;
}

/**
 * Recupera i dettagli completi di un prodotto (documento, venditore, offerte).
 */
export async function getProductDetails(productId: string, currentUserId?: string): Promise<ProductDetail> {
    let product: Product | null = null;
    let sellerName: string | null = null;
    let sellerImage: string | null = null;
    let maxOffer: number | null = null;
    let userOffer: number | null = null;

    // 1) Ottieni il documento "products"
    const docSnap = await fetchProductById(productId);
    if (!docSnap.exists()) {
        return {
            product: null,
            sellerName: null,
            sellerImage: null,
            maxOffer: null,
            userOffer: null,
        };
    }

    // I dati grezzi del prodotto
    const data = docSnap.data()!;
    // Creiamo un oggetto Product completo di tutti i campi, inclusi condition e sold
    product = {
        id: docSnap.id,
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        category: data.category || '',
        userId: data.userId || '',
        createdAt: data.createdAt || Timestamp.now(),
        image: data.image || '',
        condition: data.condition || '',
        sold: data.sold || false,
    };

    // 2) Ottieni i dati utente venditore
    const userSnap = await fetchUserById(product.userId);
    if (userSnap.exists()) {
        sellerName = userSnap.data().fullName || 'Venditore sconosciuto';
        sellerImage = userSnap.data().imageUrl || null;
    }

    // 3) Offerte
    const offersSnap = await fetchOffersByProductId(product.id);
    let maxOfferAmount = 0;
    let userCurrentOffer: number | null = null;

    offersSnap.forEach((doc) => {
        const offerData = doc.data() as { amount: number; buyerId: string };
        if (offerData.amount > maxOfferAmount) {
            maxOfferAmount = offerData.amount;
        }
        if (offerData.buyerId === currentUserId) {
            userCurrentOffer = offerData.amount;
        }
    });

    maxOffer = maxOfferAmount > 0 ? maxOfferAmount : null;
    userOffer = userCurrentOffer || null;

    return {
        product,
        sellerName,
        sellerImage,
        maxOffer,
        userOffer,
    };
}

/**
 * Crea (o trova) la chat tra l'acquirente e il venditore di un prodotto.
 * Restituisce l'ID della chat.
 */
export async function contactSeller(productId: string, buyerId: string, sellerId: string): Promise<string> {
    // Verifica se esiste già la chat
    const snap = await findChat(productId, buyerId, sellerId);
    if (!snap.empty) {
        // Ritorna la prima chat trovata
        return snap.docs[0].id;
    } else {
        // Crea nuova chat
        const chatDoc = await createChat(productId, buyerId, sellerId);
        return chatDoc.id;
    }
}

/**
 * Inserisce una nuova offerta per un prodotto.
 */
export async function makeOffer(product: Product, userId: string, offerAmount: number) {
    // Salva l'offerta su Firestore
    await addOffer(product.id, userId, offerAmount);
}

/**
 * Cancella l'offerta dell'utente su uno specifico prodotto.
 */
export async function cancelOffer(productId: string, buyerId: string) {
    await deleteOffers(productId, buyerId);
}