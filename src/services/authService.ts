import { auth } from '@/data/firebase';
import { User } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import {useEffect, useState} from "react";

/**
 * Recupera l'utente attualmente autenticato tramite Firebase Authentication.
 * @returns L'oggetto utente autenticato o `null` se nessuno è autenticato.
 */
export const getCurrentUser = async (): Promise<User | null> => {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(
            (user) => {
                unsubscribe(); // Interrompe l'ascolto dopo aver ottenuto lo stato
                resolve(user);
            },
            (error) => {
                unsubscribe(); // Interrompe l'ascolto in caso di errore
                reject(error);
            }
        );
    });
};

export function getCurrentUserId() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }
    return user.uid;
}




export const signInWithEmail = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        throw new Error('Credenziali non valide. Riprova.')
    }
}

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
        await signInWithPopup(auth, provider)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        throw new Error('Errore nel login con Google. Riprova.')
    }
}

type ValidationRules = {
    required?: boolean;
    pattern?: RegExp;
    minLength?: number;
};

export function useFormValidation(value: string, rules: ValidationRules): string | null {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (rules.required && !value) {
            setError('This field is required');
        } else if (rules.pattern && !rules.pattern.test(value)) {
            setError('Invalid format');
        } else if (rules.minLength && value.length < rules.minLength) {
            // setError(Must be at least ${rules.minLength} characters);
        } else {
            setError(null);
        }
    }, [value, rules]);

    return error;
}
