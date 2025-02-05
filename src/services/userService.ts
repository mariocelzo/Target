import { fetchUserData, updateUserData, updateUserProfileImage,UserData} from '@/data/userRepository';
import {db, auth } from '@/data/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
/**
 * Interfaccia per i dati aggiornabili del profilo utente.
 */
interface UserProfileData {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    [key: string]: string | undefined; // Permette di gestire campi aggiuntivi opzionali
}

/**
 * Ottiene l'ID dell'utente autenticato corrente.
 */
export function getCurrentUserId() {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('Utente non autenticato.');
    }
    return user.uid;
}

/**
 * Recupera i dati del profilo dell'utente autenticato.
 */
export async function getUserProfile() {
    const userId = getCurrentUserId();
    return await fetchUserData(userId);
}

/**
 * Aggiorna i dati del profilo dell'utente autenticato.
 */
export async function updateUserProfile(userData: UserProfileData) {
    const userId = getCurrentUserId();
    await updateUserData(userId, userData);
}

/**
 * Aggiorna l'immagine del profilo dell'utente autenticato.
 */
export async function updateProfileImage(imageFile: File) {
    const userId = getCurrentUserId();
    const base64Image = await convertToBase64(imageFile);
    await updateUserProfileImage(userId, base64Image);
    return base64Image;
}

/**
 * Converte un file immagine in Base64.
 */
function convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export async function registerUser(data: UserData): Promise<FirebaseUser> {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email!, data.password!);
    const firebaseUser = userCredential.user;

    // Salvataggio utente in Firestore
    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, {
        fullName: data.fullName || '',
        email: data.email || '',
        dateOfBirth: data.dateOfBirth || '',
        province: data.province || '',
        city: data.city || '',
        address: data.address || '',
        zipCode: data.zipCode || '',
        phoneNumber: data.phoneNumber || '',
        createdAt: serverTimestamp(),
    }, { merge: true });

    return firebaseUser;
}

/**
 * Effettua il sign-in o la registrazione con Google.
 */
export async function registerOrLoginWithGoogle(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;

    // Creazione/Aggiornamento dati utente in Firestore
    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, {
        fullName: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        createdAt: serverTimestamp(),
    }, { merge: true });

    return firebaseUser;
}