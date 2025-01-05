import { fetchUserData, updateUserData, updateUserProfileImage } from '@/data/userRepository';
import { auth } from '@/data/firebase';

/**
 * Gets the current authenticated user's ID.
 */
export function getCurrentUserId() {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('Utente non autenticato.');
    }
    return user.uid;
}

/**
 * Fetches the authenticated user's data.
 */
export async function getUserProfile() {
    const userId = getCurrentUserId();
    return await fetchUserData(userId);
}

/**
 * Updates the authenticated user's profile data.
 */
export async function updateUserProfile(userData: Record<string, any>) {
    const userId = getCurrentUserId();
    await updateUserData(userId, userData);
}

/**
 * Updates the authenticated user's profile image.
 */
export async function updateProfileImage(imageFile: File) {
    const userId = getCurrentUserId();
    const base64Image = await convertToBase64(imageFile);
    await updateUserProfileImage(userId, base64Image);
    return base64Image;
}

/**
 * Converts an image file to Base64.
 */
function convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}