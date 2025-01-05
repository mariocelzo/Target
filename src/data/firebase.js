// Importazioni necessarie
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';  // Importazione corretta
import { getFirestore } from 'firebase/firestore';

// Configurazione Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7MbVeT2iRfr5K2St2YqGp9bYrv1rgBIE",
    authDomain: "target-8b44c.firebaseapp.com",
    projectId: "target-8b44c",
    storageBucket: "target-8b44c.firebasestorage.app",
    messagingSenderId: "17450701981",
    appId: "1:17450701981:web:7611318f79bdf630dd7074",
    measurementId: "G-NEE9CYPC64"
};

// Inizializzazione dell'app Firebase
const app = initializeApp(firebaseConfig);

// Esportazione delle istanze di Auth e Firestore
export const auth = getAuth(app);  // Ottieni istanza di autenticazione
export const db = getFirestore(app);  // Ottieni istanza di Firestore

