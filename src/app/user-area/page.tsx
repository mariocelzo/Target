'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Function to convert an image file to Base64
const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export default function UserProfile() {
    const [userData, setUserData] = useState({
        fullName: '',
        email: '',
        dateOfBirth: '',
        province: '',
        city: '',
        address: '',
        zipCode: '',
        phoneNumber: '',
        bio: '',
        imageUrl: '',
    });
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    // Fetch user data from Firestore
    const fetchUserData = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUserData({
                        fullName: data.fullName || '',
                        email: data.email || '',
                        dateOfBirth: data.dateOfBirth || '',
                        province: data.province || '',
                        city: data.city || '',
                        address: data.address || '',
                        zipCode: data.zipCode || '',
                        phoneNumber: data.phoneNumber || '',
                        bio: data.bio || '',
                        imageUrl: data.imageUrl || '/placeholder.svg',
                    });
                }
            }
        } catch (error) {
            console.error('Errore nel recupero dei dati utente:', error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle profile image upload and conversion to Base64
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            try {
                const base64Image = await convertToBase64(file);
                setUserData((prev) => ({ ...prev, imageUrl: base64Image }));

                const user = auth.currentUser;
                if (user) {
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, { imageUrl: base64Image });
                }

                alert('Immagine del profilo aggiornata con successo!');
            } catch (error) {
                console.error('Errore durante la conversione dell immagine:', error);
            } finally {
                setUploading(false);
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { ...userData });
                alert('Dati aggiornati con successo!');
            }
        } catch (error) {
            console.error('Errore nell aggiornamento dei dati:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#41978F] to-[#2c6964] text-white p-8">
            <Card className="max-w-2xl mx-auto overflow-hidden">
                <CardHeader className="bg-[#C4333B] text-white">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Profilo Utente</h1>
                        <button
                            onClick={() => router.push('/')}
                            className="text-white p-2 hover:bg-gray-600 rounded-full"
                        >
                            <Home className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-sm opacity-75">Modifica e visualizza le tue informazioni personali</p>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative group">
                            <input
                                id="profileImage"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                            <label htmlFor="profileImage" className="cursor-pointer">
                                <div className="relative w-24 h-24">
                                    <Avatar className="w-full h-full">
                                        <AvatarImage src={userData.imageUrl} alt={userData.fullName} />
                                        <AvatarFallback>{userData.fullName?.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                        <span className="text-white text-3xl font-bold">+</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                        {uploading && <p className="text-sm text-red-500">Caricamento in corso...</p>}
                        <div>
                            <h2 className="text-2xl font-semibold text-[#C4333B]">{userData.fullName}</h2>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {Object.entries(userData).map(([key, value]) => (
                            key !== 'imageUrl' && (
                                <div key={key} className="space-y-2">
                                    <Label>{key}</Label>
                                    {key === 'bio' ? (
                                        <Textarea
                                            name={key}
                                            value={value ?? ''}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-md text-black"
                                        />
                                    ) : (
                                        <Input
                                            name={key}
                                            value={value || ''}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-md text-black"
                                        />
                                    )}
                                </div>
                            )
                        ))}
                        <Button type="submit" className="bg-[#C4333B] text-white py-2 px-4 rounded-md">
                            Salva Modifiche
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}