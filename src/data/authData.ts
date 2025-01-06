import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/data/firebase';

// Definiamo un tipo per l'errore che includa la proprietà `code`
interface FirebaseAuthError extends Error {
    code: string;
}

export async function authenticateUser(credentials: { email: string; password: string }) {
    const { email, password } = credentials;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        return {
            uid: user.uid,
            email: user.email,
            token: await user.getIdToken(),
        };
    } catch (error) {
        console.error('Errore durante l\'autenticazione:', error);

        // Verifica che l'errore sia del tipo FirebaseAuthError
        if ((error as FirebaseAuthError).code) {
            switch ((error as FirebaseAuthError).code) {
                case 'auth/user-not-found':
                    throw new Error('Utente non trovato. Verifica le tue credenziali.');
                case 'auth/wrong-password':
                    throw new Error('Password errata. Riprova.');
                default:
                    throw new Error('Errore durante l\'autenticazione. Riprova più tardi.');
            }
        }

        // In caso di errore imprevisto
        throw new Error('Errore sconosciuto durante l\'autenticazione.');
    }
}
