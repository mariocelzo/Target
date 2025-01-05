import { auth } from '@/data/firebase';
import { User } from 'firebase/auth';

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