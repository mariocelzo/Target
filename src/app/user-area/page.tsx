'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, updateUserProfile, updateProfileImage } from '@/services/userService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Label } from '@/components/Label';
import { Textarea } from '@/components/Textarea';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Save, Home, Camera } from 'lucide-react';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'personal' | 'address'>('personal');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const router = useRouter();

    useEffect(() => {
        const loadUserProfile = async () => {
            setLoading(true);
            try {
                const data = await getUserProfile();
                setUserData((prev) => ({ ...prev, ...data }));
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setError('Errore durante il caricamento dei dati utente.');
            } finally {
                setLoading(false);
            }
        };
        loadUserProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            try {
                const base64Image = await updateProfileImage(file);
                setUserData((prev) => ({ ...prev, imageUrl: base64Image }));
                setSuccess('Immagine del profilo aggiornata con successo!');
            } catch {
                setError('Errore durante il caricamento dell\'immagine.');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await updateUserProfile(userData);
            setSuccess('Dati aggiornati con successo!');
        } catch {
            setError('Errore durante l\'aggiornamento dei dati.');
        }
    };

    if (loading) {
        return <div>Caricamento...</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Profilo Utente</h1>

            {/* Tabs */}
            <div className="flex justify-center mb-6">
                <button
                    className={`px-4 py-2 rounded-t-lg ${
                        activeTab === 'personal' ? 'bg-[#41978F] text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                    onClick={() => setActiveTab('personal')}
                >
                    Dati Personali
                </button>
                <button
                    className={`px-4 py-2 rounded-t-lg ${
                        activeTab === 'address' ? 'bg-[#41978F] text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                    onClick={() => setActiveTab('address')}
                >
                    Indirizzo
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
                {error && <div className="text-red-500 mb-4">{error}</div>}
                {success && <div className="text-green-500 mb-4">{success}</div>}

                {activeTab === 'personal' && (
                    <>
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="fullName">Nome Completo</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    value={userData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Mario Rossi"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleInputChange}
                                    placeholder="mario.rossi@example.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="dateOfBirth">Data di Nascita</Label>
                                <Input
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    type="date"
                                    value={userData.dateOfBirth}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="phoneNumber">Telefono</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={userData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="1234567890"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="bio">Biografia</Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    value={userData.bio}
                                    onChange={handleInputChange}
                                    placeholder="Scrivi qualcosa su di te..."
                                />
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'address' && (
                    <>
                        {/* Address Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="province">Provincia</Label>
                                <Input
                                    id="province"
                                    name="province"
                                    value={userData.province}
                                    onChange={handleInputChange}
                                    placeholder="Provincia"
                                />
                            </div>
                            <div>
                                <Label htmlFor="city">Città</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={userData.city}
                                    onChange={handleInputChange}
                                    placeholder="Città"
                                />
                            </div>
                            <div>
                                <Label htmlFor="address">Indirizzo</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={userData.address}
                                    onChange={handleInputChange}
                                    placeholder="Via Roma, 123"
                                />
                            </div>
                            <div>
                                <Label htmlFor="zipCode">CAP</Label>
                                <Input
                                    id="zipCode"
                                    name="zipCode"
                                    value={userData.zipCode}
                                    onChange={handleInputChange}
                                    placeholder="CAP"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="mt-6 flex justify-end">
                    <Button type="submit" className="bg-[#41978F] text-white px-6 py-2 rounded-lg flex items-center">
                        <Save className="mr-2" />
                        Salva
                    </Button>
                </div>
            </form>

            {/* Profile Image Upload */}
            <div className="mt-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Immagine del Profilo</h2>
                <Avatar className="mx-auto mb-4">
                    <AvatarImage src={userData.imageUrl || '/default-avatar.png'} alt="Immagine Profilo" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <label
                    htmlFor="profileImage"
                    className="cursor-pointer bg-[#C4333B] text-white px-4 py-2 rounded-lg hover:bg-[#a82c30]"
                >
                    <Camera className="mr-2 inline" />
                    Carica Immagine
                </label>
                <input
                    id="profileImage"
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                />
                {uploading && <p className="text-gray-600 mt-2">Caricamento in corso...</p>}
            </div>
        </div>
    );
}