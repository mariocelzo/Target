import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA7MbVeT2iRfr5K2St2YqGp9bYrv1rgBIE",
    authDomain: "target-8b44c.firebaseapp.com",
    projectId: "target-8b44c",
    storageBucket: "target-8b44c.firebasestorage.app",
    messagingSenderId: "17450701981",
    appId: "1:17450701981:web:7611318f79bdf630dd7074",
    measurementId: "G-NEE9CYPC64"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
if (typeof window !== 'undefined') {
    getAnalytics(app);
}

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Start Firebase emulators for local development (only in development environment)
if (process.env.NODE_ENV === 'development') {
    // Firebase Auth Emulator
    connectAuthEmulator(auth, 'http://localhost:9099');

    // Firestore Emulator
    connectFirestoreEmulator(db, 'localhost', 8080);

    // Firebase Storage Emulator (optional, if you need storage emulator)
    connectStorageEmulator(storage, 'localhost', 9199);
}

export { auth, db, storage };
