import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage, connectStorageEmulator, ref, uploadBytes, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { collection, addDoc } from "firebase/firestore";
import dynamic from "next/dynamic";

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
const isClient = typeof window !== "undefined";
if (isClient) {
    const getAnalyticsDynamic = dynamic(() => Promise.resolve(getAnalytics(app)), { ssr: false });
    getAnalyticsDynamic();
}

// Inizializza i servizi Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configura gli emulatori per sviluppo locale
if (process.env.NODE_ENV === "development") {
    console.log("Connettendo agli emulatori Firebase...");
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 9150); // Usa la porta corretta qui
    connectStorageEmulator(storage, "localhost", 9199);

    // Abilita persistenza offline per Firestore
    enableIndexedDbPersistence(db).catch((error) => {
        if (error.code === "failed-precondition") {
            console.error("Persistenza offline non abilitata: più schede aperte.");
        } else if (error.code === "unimplemented") {
            console.error("Il browser non supporta la persistenza offline.");
        }
    });
}

// Funzione per caricare immagini su Firebase Storage
export const uploadImage = async (file, userId) => {
    try {
        if (!file) {
            throw new Error("Nessun file selezionato.");
        }

        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validTypes.includes(file.type)) {
            throw new Error("Formato file non supportato. Usa JPG, PNG o GIF.");
        }

        const storageRef = ref(storage, `images/${userId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return url;
    } catch (error) {
        console.error("Errore durante il caricamento dell'immagine:", error);
        throw new Error("Impossibile caricare l'immagine. Riprova.");
    }
};

// Funzione per caricare un'immagine con stato di avanzamento
export const uploadImageWithProgress = async (file, userId) => {
    try {
        if (!file) {
            throw new Error("Nessun file selezionato.");
        }

        const storageRef = ref(storage, `images/${userId}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Caricamento: ${progress.toFixed(2)}%`);
            },
            (error) => {
                console.error("Errore durante il caricamento:", error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log("File disponibile a:", downloadURL);
                });
            }
        );
    } catch (error) {
        console.error("Errore durante il caricamento dell'immagine:", error);
        throw new Error("Impossibile caricare l'immagine. Riprova.");
    }
};

// Funzione per salvare un articolo in Firestore
export const addArticle = async (articleData) => {
    try {
        const docRef = await addDoc(collection(db, "marketplace"), articleData);
        return docRef.id;
    } catch (error) {
        console.error("Errore durante il salvataggio dell'articolo:", error);
        throw new Error("Impossibile salvare l'articolo. Riprova.");
    }
};

// Funzione per ottenere l'utente autenticato
export const getCurrentUser = () => {
    return auth.currentUser || null;
};

// Funzione per eliminare un'immagine da Firebase Storage
export const deleteImage = async (imagePath) => {
    try {
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
        console.log("Immagine eliminata con successo.");
    } catch (error) {
        console.error("Errore durante l'eliminazione dell'immagine:", error);
    }
};

// Esporta i servizi Firebase
export { auth, db, storage };