import { collection, doc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserData } from '@/models/User';

/**
 * Fetches user data from Firestore.
 */
export async function fetchUserData(userId: string) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        throw new Error('Utente non trovato.');
    }
    return userSnap.data();
}

/**
 * Updates user data in Firestore.
 */
export async function updateUserData(userId: string, userData: Partial<UserData>) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, userData);
}
/**
 * Updates user profile image in Firestore.
 */
export async function updateUserProfileImage(userId: string, imageUrl: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { imageUrl });
}

/**
 * Fetches all products of a specific user from Firestore.
 */
export async function fetchUserProducts(userId: string) {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
}

/**
 * Fetches unread messages for a user from Firestore.
 */
export async function fetchUnreadMessages(userId: string) {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('recipientId', '==', userId), where('read', '==', false));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
}

/**
 * Fetches the profile image of a specific user from Firestore.
 */
export async function fetchUserImage(userId: string) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        throw new Error('Utente non trovato.');
    }
    return userSnap.data().imageUrl || null;
}