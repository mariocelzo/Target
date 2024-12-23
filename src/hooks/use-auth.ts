"use client"; // Assicurati che venga eseguito solo lato client

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const authInstance = getAuth();
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            setCurrentUser(user || null);
            setLoading(false); // Imposta il caricamento come completato
        });

        return () => unsubscribe(); // Pulisci l'ascoltatore
    }, []);

    return { currentUser, loading };
}