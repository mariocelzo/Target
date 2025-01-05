'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/data/firebase';
import { getUserActiveAds, getUserSoldAds, removeAd } from '@/services/adService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdCard from '@/components/AdCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Ad } from '@/models/Ad'; // Importa il tipo Ad

export default function UserActiveAdsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [activeAds, setActiveAds] = useState<Ad[]>([]);
    const [soldAds, setSoldAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                // Fetch both active and sold ads
                const [activeAdsData, soldAdsData] = await Promise.all([
                    getUserActiveAds(currentUser.uid),
                    getUserSoldAds(currentUser.uid),
                ]);

                setActiveAds(activeAdsData);
                setSoldAds(soldAdsData);
            } else {
                setUser(null);
                setActiveAds([]);
                setSoldAds([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (adId: string) => {
        await removeAd(adId);
        setActiveAds((prev) => prev.filter((ad) => ad.id !== adId));
    };

    if (loading) return <LoadingSpinner />;

    if (!user) {
        return (
            <div className="text-center py-10">
                <h1 className="text-3xl font-semibold mb-6">Accedi per visualizzare i tuoi annunci</h1>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-4">Annunci Attivi</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeAds.map((ad) => (
                        <AdCard key={ad.id} ad={ad} onDelete={handleDelete} onViewOffers={() => {}} />
                    ))}
                </div>

                <h1 className="text-3xl font-bold mb-4 mt-12">Annunci Venduti</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {soldAds.map((ad) => (
                        <AdCard
                            key={ad.id}
                            ad={ad}
                            onDelete={undefined} // Disable delete for sold ads
                            onViewOffers={() => {}} // Replace with your logic
                        />
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}