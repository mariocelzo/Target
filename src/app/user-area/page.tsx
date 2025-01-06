'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Home, Camera, Save } from 'lucide-react';
import { UserData } from '../data/userData';
import { fetchUserDataFromFirestore, updateUserDataInFirestore, uploadProfileImage } from '@/services/userServicearea';

export default function UserProfile() {
    const [userData, setUserData] = useState<UserData>({
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'personal' | 'address'>('personal');
    const router = useRouter();

    // Recupera i dati utente da Firestore
    const fetchUserData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchUserDataFromFirestore();
            if (data) {
                setUserData(data);
            }
        } catch (error) {
            console.error('Errore nel recupero dei dati utente:', error);
            setError('Impossibile recuperare i dati utente. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    // Gestisce il cambiamento degli input del form
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    // Gestisce il caricamento dell'immagine del profilo
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            setError(null);
            try {
                const base64Image = await uploadProfileImage(file);
                setUserData((prev) => ({ ...prev, imageUrl: base64Image }));

                await updateUserDataInFirestore({ ...userData, imageUrl: base64Image });
                setSuccess('Immagine del profilo aggiornata con successo!');
            } catch (error) {
                console.error('Errore durante la conversione dell\'immagine:', error);
                setError('Impossibile caricare l\'immagine. Riprova più tardi.');
            } finally {
                setUploading(false);
            }
        }
    };

    // Gestisce l'invio del form
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            await updateUserDataInFirestore(userData);
            setSuccess('Dati aggiornati con successo!');
        } catch (error) {
            console.error('Errore nell\'aggiornamento dei dati:', error);
            setError('Impossibile aggiornare i dati. Riprova più tardi.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#41978F] to-[#2c6964] p-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader className="bg-[#C4333B] text-white">
                        <h1 className="text-3xl font-bold">Caricamento...</h1>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p>Stiamo caricando i tuoi dati...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#41978F] to-[#2c6964] p-8">
            <Card className="max-w-2xl mx-auto overflow-hidden">
                <CardHeader className="bg-[#C4333B] text-white">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Profilo Utente</h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/')}
                            className="text-white hover:bg-[#A62D34] rounded-full"
                        >
                            <Home className="w-6 h-6" />
                        </Button>
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
                                disabled={uploading}
                            />
                            <label htmlFor="profileImage" className="cursor-pointer">
                                <div className="relative w-24 h-24">
                                    <Avatar className="w-full h-full">
                                        <AvatarImage src={userData.imageUrl} alt={userData.fullName} />
                                        <AvatarFallback>{userData.fullName?.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </label>
                        </div>
                        {uploading && <p className="text-sm text-yellow-500">Caricamento in corso...</p>}
                        <div>
                            <h2 className="text-2xl font-semibold text-[#C4333B]">{userData.fullName}</h2>
                            <p className="text-sm text-gray-500">{userData.email}</p>
                        </div>
                    </div>

                    {error && <div className="text-sm text-red-500">{error}</div>}
                    {success && <div className="text-sm text-green-500">{success}</div>}

                    <div className="flex mb-4">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`w-1/2 text-center py-2 ${activeTab === 'personal' ? 'bg-[#C4333B] text-white' : 'bg-gray-200'}`}
                        >
                            Informazioni Personali
                        </button>
                        <button
                            onClick={() => setActiveTab('address')}
                            className={`w-1/2 text-center py-2 ${activeTab === 'address' ? 'bg-[#C4333B] text-white' : 'bg-gray-200'}`}
                        >
                            Indirizzo
                        </button>
                    </div>

                    {activeTab === 'personal' && (
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nome Completo</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    value={userData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-md"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Data di Nascita</Label>
                                <Input
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    type="date"
                                    value={userData.dateOfBirth}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-md"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Numero di Telefono</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={userData.phoneNumber}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-md"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Biografia</Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    value={userData.bio}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-md"
                                    rows={4}
                                />
                            </div>
                            <Button type="submit" className="mt-6 bg-[#C4333B] text-white py-2 px-4 rounded-md w-full">
                                <Save className="w-4 h-4 mr-2" />
                                Salva Modifiche
                            </Button>
                        </form>
                    )}

                    {activeTab === 'address' && (
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="address">Indirizzo</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={userData.address}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-md"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Città</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={userData.city}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-md"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zipCode">CAP</Label>
                                <Input
                                    id="zipCode"
                                    name="zipCode"
                                    value={userData.zipCode}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-md"
                                />
                            </div>
                            <Button type="submit" className="mt-6 bg-[#C4333B] text-white py-2 px-4 rounded-md w-full">
                                <Save className="w-4 h-4 mr-2" />
                                Salva Modifiche
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}