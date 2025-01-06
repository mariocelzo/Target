// src/services/userServicearea.ts

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/data/firebase';
import { UserData } from '@/data/userData';

// Funzione per recuperare i dati utente da Firestore
export const fetchUserDataFromFirestore = async (): Promise<UserData | null> => {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            return {
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
            } as UserData;
        }
    }
    return null;
};

// Funzione per aggiornare i dati utente in Firestore
export const updateUserDataInFirestore = async (userData: UserData): Promise<void> => {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { ...userData });
    }
};

// Funzione per caricare l'immagine del profilo e convertirla in Base64
export const uploadProfileImage = async (file: File): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
