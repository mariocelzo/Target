import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator, ref, uploadBytes, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { collection, addDoc } from "firebase/firestore";

// Configurazione Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7MbVeT2iRfr5K2St2YqGp9bYrv1rgBIE",
    authDomain: "target-8b44c.firebaseapp.com",
    projectId: "target-8b44c",
    storageBucket: "target-8b44c.appspot.com",
    messagingSenderId: "17450701981",
    appId: "1:17450701981:web:7611318f79bdf630dd7074",
    measurementId: "G-NEE9CYPC64"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Inizializza Analytics (solo lato client)
if (typeof window !== 'undefined') {
    getAnalytics(app);
}

// Inizializza i servizi di Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Emulatori per sviluppo locale
if (process.env.NODE_ENV === 'development') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
}

// Funzione per caricare immagini su Firebase Storage
export const uploadImage = async (file, userId) => {
    try {
        if (!file) {
            throw new Error("Nessun file selezionato.");
        }

        // Verifica che il file sia un'immagine (opzionale)
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            throw new Error("Formato file non supportato. Usa JPG, PNG o GIF.");
        }

        // Crea un riferimento all'immagine in Storage
        const storageRef = ref(storage, `images/${userId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file); // Carica l'immagine
        const url = await getDownloadURL(storageRef); // Ottieni l'URL pubblico
        return url;
    } catch (error) {
        console.error("Errore durante il caricamento dell'immagine:", error);
        throw new Error("Impossibile caricare l'immagine. Riprova.");
    }
};

// Funzione per caricare un'immagine con stato di avanzamento (opzionale)
export const uploadImageWithProgress = async (file, userId) => {
    try {
        if (!file) {
            throw new Error("Nessun file selezionato.");
        }

        const storageRef = ref(storage, `images/${userId}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Gestione della progressione
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Progress: ' + progress + '%');
            },
            (error) => {
                console.error("Errore durante il caricamento:", error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File disponibile a:', downloadURL);
                });
            }
        );
    } catch (error) {
        console.error("Errore durante il caricamento dell'immagine:", error);
        throw new Error("Impossibile caricare l'immagine. Riprova.");
    }
};

// Funzione per salvare un articolo nel database Firestore
export const addArticle = async (articleData) => {
    try {
        const docRef = await addDoc(collection(db, "marketplace"), articleData);
        return docRef.id; // Restituisce l'ID del documento appena creato
    } catch (error) {
        console.error("Errore durante il salvataggio dell'articolo:", error);
        throw new Error("Impossibile salvare l'articolo. Riprova.");
    }
};

// Funzione per ottenere l'utente attualmente autenticato
export const getCurrentUser = () => {
    return auth.currentUser; // Restituisce l'utente autenticato o null
};

// Funzione per eliminare un'immagine da Firebase Storage
export const deleteImage = async (imageUrl) => {
    try {
        const imageRef = ref(storage, imageUrl); // Ottieni il riferimento all'immagine
        await deleteObject(imageRef);
        console.log("Immagine eliminata con successo.");
    } catch (error) {
        console.error("Errore durante l'eliminazione dell'immagine:", error);
    }
};

// Esporta i servizi Firebase
export { auth, db, storage };
