"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Camera, MessageSquare, Edit2, Building2, MapPinned } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Assumendo che `db` sia l'istanza di Firestore exportata dal file di configurazione di Firebase
import { useAuth } from "@/hooks/use-auth"; // Optional, se usi un hook per autenticazione utente

interface UserData {
    name: string;
    email: string;
    phone: string;
    address: string;
    province: string;
    zipCode: string;
    bio: string;
}

export default function UserProfile() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [tempUserData, setTempUserData] = useState<UserData | null>(null); // Per l'editing
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // Stato per gli errori

    const { currentUser } = useAuth(); // Per ottenere l'uid dell'utente
    const userId = currentUser?.uid;

    useEffect(() => {
        if (!userId) {
            setError("Utente non autenticato o ID utente non disponibile.");
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", userId)); // Usa l'ID dell'utente
                if (userDoc.exists()) {
                    setUserData(userDoc.data() as UserData);
                } else {
                    setError("Utente non trovato nel Firestore.");
                }
            } catch (error) {
                console.error("Errore durante il recupero dei dati utente:", error);
                setError("Errore durante il recupero dei dati utente.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTempUserData((prevData) => prevData && { ...prevData, [name as keyof UserData]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (tempUserData) {
            try {
                await setDoc(doc(db, "users", userId!), tempUserData); // Usa l'ID dell'utente
                setUserData(tempUserData); // Aggiorna i dati visualizzati
                console.log("Dati utente aggiornati:", tempUserData);
            } catch (error) {
                console.error("Errore durante l'aggiornamento dei dati utente:", error);
                setError("Errore durante l'aggiornamento dei dati utente.");
            }
        }
    };

    const MotionCard = motion(Card);

    if (loading) {
        return <div>Caricamento...</div>; // Schermata di caricamento mentre i dati vengono recuperati
    }

    if (error) {
        return <div className="text-red-500">{error}</div>; // Mostra eventuali errori
    }

    if (!userData) {
        return <div>Nessun dato utente trovato.</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#41978F] to-[#2c6964] text-white p-8">
            <MotionCard
                className="max-w-2xl mx-auto overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <CardHeader className="bg-[#C4333B] text-white">
                    <h1 className="text-3xl font-bold">Target</h1>
                    <p className="text-sm opacity-75">Il Tuo Profilo Personale</p>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src="/placeholder.svg?height=96&width=96" alt={userData.name} />
                            <AvatarFallback>{userData?.name?.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-semibold text-[#C4333B]">{userData.name}</h2>
                            <div className="flex items-center mt-2">
                                <MessageSquare className="text-[#C4333B] w-5 h-5 mr-2" />
                                <span className="text-[#41978F] font-semibold">120 Feedback</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 mt-6">
                        {Object.entries(userData).map(([key, value]) => (
                            <div key={key} className="flex items-start space-x-2">
                                {key === "name" && <User className="text-[#C4333B] w-5 h-5 mt-1" />}
                                {key === "email" && <Mail className="text-[#C4333B] w-5 h-5 mt-1" />}
                                {key === "phone" && <Phone className="text-[#C4333B] w-5 h-5 mt-1" />}
                                {key === "address" && <MapPin className="text-[#C4333B] w-5 h-5 mt-1" />}
                                {key === "province" && <Building2 className="text-[#C4333B] w-5 h-5 mt-1" />}
                                {key === "zipCode" && <MapPinned className="text-[#C4333B] w-5 h-5 mt-1" />}
                                {key === "bio" && <Camera className="text-[#C4333B] w-5 h-5 mt-1" />}
                                <span className="text-[#41978F] font-semibold mt-1 w-24">
                                    {key === "name" && "Nome:"}
                                    {key === "email" && "Email:"}
                                    {key === "phone" && "Telefono:"}
                                    {key === "address" && "Indirizzo:"}
                                    {key === "province" && "Provincia:"}
                                    {key === "zipCode" && "CAP:"}
                                    {key === "bio" && "Bio:"}
                                </span>
                                <span className="text-gray-700 flex-1">{value}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-end">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-white hover:bg-gray-100 text-[#C4333B] border border-[#C4333B]">
                                <Edit2 className="w-4 h-4 mr-2" />
                                Modifica Profilo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Modifica il tuo profilo</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {Object.entries(userData).map(([key, value]) => (
                                    <div key={key} className="space-y-2">
                                        <Label htmlFor={key} className="text-right">
                                            {key === "name" && "Nome"}
                                            {key === "email" && "Email"}
                                            {key === "phone" && "Telefono"}
                                            {key === "address" && "Indirizzo"}
                                            {key === "province" && "Provincia"}
                                            {key === "zipCode" && "CAP"}
                                            {key === "bio" && "Bio"}
                                        </Label>
                                        {key === "bio" ? (
                                            <Textarea
                                                id={key}
                                                name={key}
                                                value={tempUserData ? tempUserData[key as keyof UserData] : value}
                                                onChange={handleInputChange}
                                                className="col-span-3 border-[#C4333B] focus:ring-[#C4333B] focus:border-[#C4333B]"
                                            />
                                        ) : (
                                            <Input
                                                id={key}
                                                name={key}
                                                value={tempUserData ? tempUserData[key as keyof UserData] : value}
                                                onChange={handleInputChange}
                                                className="col-span-3 border-[#C4333B] focus:ring-[#C4333B] focus:border-[#C4333B]"
                                            />
                                        )}
                                    </div>
                                ))}
                                <div className="flex justify-end space-x-4">
                                    <Button type="button" variant="outline" className="bg-[#C4333B] hover:bg-[#C4333B]">
                                        Annulla
                                    </Button>
                                    <Button type="submit" className="bg-[#C4333B] hover:bg-[#A12D34]">
                                        Salva
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </MotionCard>
        </div>
    );
}