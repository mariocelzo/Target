import { fetchActiveAds, fetchSoldAds, deleteAd, acceptOffer } from '@/data/adRepository';

export async function getUserActiveAds(userId: string) {
    return await fetchActiveAds(userId);
}

export async function getUserSoldAds(userId: string) {
    return await fetchSoldAds(userId);
}

export async function removeAd(adId: string) {
    await deleteAd(adId);
}

export async function handleOfferAcceptance(adId: string, offerId: string, buyerData: any, offerAmount: number) {
    return await acceptOffer(adId, offerId, buyerData, offerAmount);
}