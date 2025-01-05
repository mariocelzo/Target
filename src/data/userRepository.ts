// userRepository.ts
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    updateDoc,
    setDoc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    User as FirebaseUser,
} from 'firebase/auth';

import { db, auth } from './firebase';

/**
 * Dati di base di un utente in Firestore
 */
export interface UserData {
    fullName?: string;
    email?: string;
    /**
     * Di solito la password NON si salva in Firestore,
     * ma la teniamo se fa parte del form (non salvata).
     */
    password?: string;
    dateOfBirth?: string;
    province?: string;
    city?: string;
    address?: string;
    zipCode?: string;
    phoneNumber?: string;
    imageUrl?: string;
    createdAt?: Timestamp;  // Usiamo Firebase Timestamp
    [key: string]: unknown; // Per eventuali campi extra
}

/**
 * Dati di base per un prodotto in Firestore
 */
export interface ProductData {
    id?: string;
    userId: string;
    name: string;
    description: string;
    price: number;
    category?: string;
    createdAt?: Timestamp; // Timestamp
    image?: string;
    sold?: boolean;
    [key: string]: unknown;
}

/**
 * Dati di base per un messaggio in Firestore
 */
export interface MessageData {
    id?: string;
    senderId: string;
    recipientId: string;
    text: string;
    read: boolean;
    createdAt?: Timestamp; // Timestamp
    [key: string]: unknown;
}

/**
 * Crea un nuovo account Firebase con email e password,
 * quindi crea/aggiorna il documento utente in Firestore.
 */
export async function registerUser(data: UserData): Promise<FirebaseUser> {
    // 1) Crea l'account su Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, data.email!, data.password!);
    const firebaseUser = userCredential.user;

    // 2) Crea/aggiorna il documento utente su Firestore
    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(
        userRef,
        {
            fullName: data.fullName || '',
            email: data.email || '',
            dateOfBirth: data.dateOfBirth || '',
            province: data.province || '',
            city: data.city || '',
            address: data.address || '',
            zipCode: data.zipCode || '',
            phoneNumber: data.phoneNumber || '',
            createdAt: serverTimestamp(),
        },
        { merge: true }
    );

    return firebaseUser;
}

/**
 * Effettua il sign-in o la registrazione con Google.
 * Restituisce l'oggetto user autenticato.
 */
export async function registerOrLoginWithGoogle(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;

    // Se vuoi salvare alcuni campi base
    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(
        userRef,
        {
            fullName: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            createdAt: serverTimestamp(),
        },
        { merge: true }
    );

    return firebaseUser;
}

/**
 * Fetches user data from Firestore.
 */
export async function fetchUserData(userId: string): Promise<UserData> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        throw new Error('Utente non trovato.');
    }
    return userSnap.data() as UserData;
}

/**
 * Updates user data in Firestore.
 */
export async function updateUserData(
    userId: string,
    userData: Partial<UserData>
): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, userData);
}

/**
 * Updates user profile image in Firestore.
 */
export async function updateUserProfileImage(
    userId: string,
    imageUrl: string
): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { imageUrl });
}

/**
 * Fetches all products of a specific user from Firestore.
 */
export async function fetchUserProducts(userId: string): Promise<ProductData[]> {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    // Tipizziamo i dati come ProductData
    return querySnapshot.docs.map((doc) => {
        const product = doc.data() as ProductData;
        return {
            ...product,
            id: doc.id, // aggiungiamo manualmente l'ID
        };
    });
}

/**
 * Fetches unread messages for a user from Firestore.
 */
export async function fetchUnreadMessages(userId: string): Promise<MessageData[]> {
    const messagesRef = collection(db, 'messages');
    const q = query(
        messagesRef,
        where('recipientId', '==', userId),
        where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);

    // Tipizziamo i dati come MessageData
    return querySnapshot.docs.map((doc) => {
        const message = doc.data() as MessageData;
        return {
            ...message,
            id: doc.id,
        };
    });
}

/**
 * Fetches the profile image of a specific user from Firestore.
 */
export async function fetchUserImage(userId: string): Promise<string | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        throw new Error('Utente non trovato.');
    }
    return (userSnap.data().imageUrl as string) || null;
}