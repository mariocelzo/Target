import { fetchActiveAds, fetchSoldAds, deleteAd, acceptOffer } from '@/data/adRepository';
import { Timestamp } from 'firebase/firestore';

// Definizione dell'interfaccia Offer
interface Offer {
    id: string; // ID dell'offerta
    amount: number; // Importo dell'offerta
    buyerId: string; // ID dell'acquirente
    createdAt: Timestamp; // Timestamp di creazione
    productId: string; // ID del prodotto associato
    fullName: string; // Nome completo dell'acquirente
    phone: string; // Numero di telefono dell'acquirente
    shippingAddress: {
        address: string; // Indirizzo
        city: string; // Città
        province: string; // Provincia
        postalCode: string; // CAP (modificato da zipCode)
        country: string; // Paese (aggiunto)
    }; // Dettagli sull'indirizzo di spedizione
}

export async function getUserActiveAds(userId: string) {
    return await fetchActiveAds(userId);
}

export async function getUserSoldAds(userId: string) {
    return await fetchSoldAds(userId);
}

export async function removeAd(adId: string) {
    await deleteAd(adId);
}

// Aggiornata la funzione per utilizzare Offer come tipo compatibile con BuyerData
export async function handleOfferAcceptance(adId: string, offerId: string, buyerData: Offer, offerAmount: number) {
    return await acceptOffer(adId, offerId, buyerData, offerAmount);
}