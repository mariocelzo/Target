'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Home, Camera, Save, Edit2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner'; // Import del componente per il caricamento


import { UserData } from '../data/userData';
import {
    fetchUserDataFromFirestore,
    updateUserDataInFirestore,
    uploadProfileImage,
} from '@/services/userServicearea';

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

    // Quale tab è attiva
    const [activeTab, setActiveTab] = useState<'personal' | 'address'>('personal');

    // Gestione “modifica” per le singole sezioni
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);

    // Stato per mostrare/nascondere l’alert personalizzato
    const [showAlert, setShowAlert] = useState(false);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Gestisce il cambiamento degli input
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
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
                setShowAlert(true);
            } catch (error) {
                console.error("Errore durante la conversione dell'immagine:", error);
                setError("Impossibile caricare l'immagine. Riprova più tardi.");
            } finally {
                setUploading(false);
            }
        }
    };

    // Gestisce il salvataggio dei dati nel form
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            await updateUserDataInFirestore(userData);

            // Messaggi e alert personalizzato
            setSuccess('Dati aggiornati con successo!');
            setShowAlert(true);

            // Dopo il salvataggio, disattiva lo stato di editing
            if (activeTab === 'personal') setIsEditingPersonal(false);
            if (activeTab === 'address') setIsEditingAddress(false);
        } catch (error) {
            console.error("Errore nell'aggiornamento dei dati:", error);
            setError('Impossibile aggiornare i dati. Riprova più tardi.');
        }
    };

    // Varianti per animare l'intera pagina (fade+slide in/out)
    const pageVariants = {
        hidden: { opacity: 0, x: 50 },
        enter: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    };
// Se lo stato `loading` è vero, mostra la rotella di caricamento
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#41978F] to-[#2c6964] p-8 flex items-center justify-center">
                <LoadingSpinner /> {/* Rotella di caricamento */}
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="userProfilePage"
                className="min-h-screen bg-gradient-to-br from-[#41978F] to-[#2c6964] p-8"
                variants={pageVariants}
                initial="hidden"
                animate="enter"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
                <Card className="max-w-2xl mx-auto w-full shadow-2xl overflow-hidden">
                    {/* Header */}
                    <CardHeader className="bg-[#C4333B] text-white rounded-b-xl">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold">Profilo Utente</h1>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/')}
                                className="text-white hover:bg-[#A62D34] rounded-full transition-colors"
                            >
                                <Home className="w-6 h-6" />
                            </Button>
                        </div>
                        <p className="text-sm opacity-75">
                            Visualizza e modifica le tue informazioni personali
                        </p>
                    </CardHeader>

                    {/* Contenuto */}
                    <CardContent className="p-6 bg-white">
                        {/* Sezione Avatar */}
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
                                    <div className="relative w-24 h-24 transition-transform transform group-hover:scale-105">
                                        <Avatar className="w-full h-full ring-2 ring-offset-2 ring-[#C4333B]">
                                            <AvatarImage
                                                src={userData.imageUrl}
                                                alt={userData.fullName}
                                            />
                                            <AvatarFallback>
                                                {userData.fullName
                                                    ?.split(' ')
                                                    .map((n) => n[0])
                                                    .join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </label>
                            </div>
                            {uploading && (
                                <p className="text-sm text-yellow-500">Caricamento in corso...</p>
                            )}
                            <div>
                                <h2 className="text-2xl font-semibold text-[#C4333B] leading-tight">
                                    {userData.fullName}
                                </h2>
                                <p className="text-sm text-gray-500">{userData.email}</p>
                            </div>
                        </div>

                        {/* Messaggi di errore e successo (eventualmente anche nel custom alert, ma li manteniamo) */}
                        {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
                        {success && <div className="text-sm text-green-500 mb-2">{success}</div>}

                        {/* Tab Header “pill style” */}
                        <div className="relative bg-gray-200 rounded-full p-1 flex mb-6">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`relative flex-1 py-2 px-4 text-center rounded-full font-semibold transition-colors
                  ${
                                    activeTab === 'personal'
                                        ? 'bg-[#C4333B] text-white shadow'
                                        : 'text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                                Informazioni Personali
                            </button>
                            <button
                                onClick={() => setActiveTab('address')}
                                className={`relative flex-1 py-2 px-4 text-center rounded-full font-semibold transition-colors
                  ${
                                    activeTab === 'address'
                                        ? 'bg-[#C4333B] text-white shadow'
                                        : 'text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                                Indirizzo
                            </button>
                        </div>

                        {/* Contenuto tab con animazione (slide) */}
                        <div className="relative w-full overflow-hidden h-auto min-h-[260px]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'personal' && (
                                    <motion.div
                                        key="personal"
                                        initial={{ x: 80, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -80, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                                        className="absolute w-full"
                                    >
                                        {/* VISTA “PERSONAL” */}
                                        {!isEditingPersonal ? (
                                            /* Modalità sola lettura */
                                            <div className="space-y-2">
                                                <div>
                                                    <Label className="font-semibold text-gray-700">
                                                        Nome Completo
                                                    </Label>
                                                    <p className="ml-2 text-gray-600">
                                                        {userData.fullName || '—'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="font-semibold text-gray-700">
                                                        Data di Nascita
                                                    </Label>
                                                    <p className="ml-2 text-gray-600">
                                                        {userData.dateOfBirth || '—'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="font-semibold text-gray-700">
                                                        Numero di Telefono
                                                    </Label>
                                                    <p className="ml-2 text-gray-600">
                                                        {userData.phoneNumber || '—'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="font-semibold text-gray-700">
                                                        Biografia
                                                    </Label>
                                                    <p className="ml-2 text-gray-600 whitespace-pre-line">
                                                        {userData.bio || '—'}
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => setIsEditingPersonal(true)}
                                                    className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Modifica
                                                </Button>
                                            </div>
                                        ) : (
                                            /* Modalità editing */
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
                                                <div className="space-y-2 mt-4">
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
                                                <div className="space-y-2 mt-4">
                                                    <Label htmlFor="phoneNumber">Numero di Telefono</Label>
                                                    <Input
                                                        id="phoneNumber"
                                                        name="phoneNumber"
                                                        value={userData.phoneNumber}
                                                        onChange={handleInputChange}
                                                        className="w-full border rounded-md"
                                                    />
                                                </div>
                                                <div className="space-y-2 mt-4">
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

                                                {/* Bottoni azione */}
                                                <div className="flex gap-2 mt-6">
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsEditingPersonal(false);
                                                            setError(null);
                                                            setSuccess(null);
                                                        }}
                                                        className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                                                    >
                                                        Annulla
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        className="bg-[#C4333B] text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-[#A62D34] transition-colors"
                                                    >
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Salva Modifiche
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'address' && (
                                    <motion.div
                                        key="address"
                                        initial={{ x: 80, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -80, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                                        className="absolute w-full"
                                    >
                                        {/* VISTA “ADDRESS” */}
                                        {!isEditingAddress ? (
                                            /* Modalità sola lettura */
                                            <div className="space-y-2">
                                                <div>
                                                    <Label className="font-semibold text-gray-700">
                                                        Indirizzo
                                                    </Label>
                                                    <p className="ml-2 text-gray-600">
                                                        {userData.address || '—'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="font-semibold text-gray-700">
                                                        Città
                                                    </Label>
                                                    <p className="ml-2 text-gray-600">
                                                        {userData.city || '—'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="font-semibold text-gray-700">
                                                        CAP
                                                    </Label>
                                                    <p className="ml-2 text-gray-600">
                                                        {userData.zipCode || '—'}
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => setIsEditingAddress(true)}
                                                    className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Modifica
                                                </Button>
                                            </div>
                                        ) : (
                                            /* Modalità editing */
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
                                                <div className="space-y-2 mt-4">
                                                    <Label htmlFor="city">Città</Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        value={userData.city}
                                                        onChange={handleInputChange}
                                                        className="w-full border rounded-md"
                                                    />
                                                </div>
                                                <div className="space-y-2 mt-4">
                                                    <Label htmlFor="zipCode">CAP</Label>
                                                    <Input
                                                        id="zipCode"
                                                        name="zipCode"
                                                        value={userData.zipCode}
                                                        onChange={handleInputChange}
                                                        className="w-full border rounded-md"
                                                    />
                                                </div>

                                                {/* Bottoni azione */}
                                                <div className="flex gap-2 mt-6">
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsEditingAddress(false);
                                                            setError(null);
                                                            setSuccess(null);
                                                        }}
                                                        className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                                                    >
                                                        Annulla
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        className="bg-[#C4333B] text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-[#A62D34] transition-colors"
                                                    >
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Salva Modifiche
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>

                {/* Alert personalizzato */}
                {showAlert && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-md shadow-lg relative max-w-sm w-full">
                            {/* Bottone close */}
                            <button
                                onClick={() => {
                                    setShowAlert(false);
                                    setSuccess(null);
                                }}
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>

                            <div className="flex flex-col items-center">
                                {/* Logo personalizzato */}
                                <img
                                    src="/logoNosfondo.png"
                                    alt="Logo"
                                    className="w-16 h-16 mb-4"
                                />

                                <h2 className="text-lg font-semibold mb-2">
                                    Dati Aggiornati!
                                </h2>
                                <p className="text-sm text-gray-600 text-center">
                                    I tuoi dati sono stati salvati correttamente.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}