import { fetchUserData, updateUserData, updateUserProfileImage } from '@/data/userRepository';
import { auth } from '@/data/firebase';

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