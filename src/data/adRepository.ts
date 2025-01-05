// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from './firebase';

// Definizione del tipo per Annunci (Ads)
export interface Ad {
    id: string;
    image: string;
    title: string;
    price: number;
    productCategory: string;
    sold: boolean;
}

// Definizione del tipo per i Dati dell'Acquirente
export interface BuyerData {
    id: string;
    fullName: string;
    phone: string;
    shippingAddress: {
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
}

// Funzione per recuperare annunci attivi
export async function fetchActiveAds(userId: string): Promise<Ad[]> {
    const activeAdsQuery = query(
        collection(db, 'products'),
        where('userId', '==', userId),
        where('sold', '==', false)
    );
    const activeSnapshot = await getDocs(activeAdsQuery);
    return activeSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            image: data.image || '',
            title: data.title || '',
            price: data.price || 0,
            productCategory: data.productCategory || '',
            sold: data.sold || false,
        };
    });
}

// Funzione per recuperare annunci venduti
export async function fetchSoldAds(userId: string): Promise<Ad[]> {
    const soldAdsQuery = query(
        collection(db, 'products'),
        where('userId', '==', userId),
        where('sold', '==', true)
    );
    const soldSnapshot = await getDocs(soldAdsQuery);
    return soldSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            image: data.image || '',
            title: data.title || '',
            price: data.price || 0,
            productCategory: data.productCategory || '',
            sold: data.sold || true,
        };
    });
}

// Funzione per eliminare un annuncio
export async function deleteAd(adId: string): Promise<void> {
    const adRef = doc(db, 'products', adId);
    await deleteDoc(adRef);
}

// Funzione per accettare un'offerta
export async function acceptOffer(
    adId: string,
    offerId: string,
    buyerData: BuyerData,
    offerAmount: number
): Promise<{ orderId: string; buyerData: BuyerData }> {
    const adRef = doc(db, 'products', adId);
    await updateDoc(adRef, { sold: true, price: offerAmount });

    const orderRef = await addDoc(collection(db, 'orders'), {
        productId: adId,
        buyerId: buyerData.id,
        fullName: buyerData.fullName,
        phone: buyerData.phone,
        quantity: 1,
        shippingAddress: buyerData.shippingAddress,
        createdAt: new Date(),
    });

    const offerRef = doc(db, 'offers', offerId);
    await updateDoc(offerRef, { accepted: true });

    return { orderId: orderRef.id, buyerData };
}