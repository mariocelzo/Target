// src/services/contactService.ts
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/data/firebase';

export const handleContactFormSubmit = async (contactData: {
    name: string;
    surname: string;
    email: string;
    message: string;
}) => {
    const contactRef = collection(db, 'contacts');
    await addDoc(contactRef, { ...contactData, timestamp: new Date() });

    // Simula invio email (puoi sostituirlo con una reale integrazione di invio email)
    console.log(`Sending email to ${contactData.email}:
    Subject: Grazie per averci contattato!
    Body: Ciao ${contactData.name},

Grazie per aver contattato il nostro supporto. Abbiamo ricevuto la tua richiesta e faremo del nostro meglio per risponderti il prima possibile.

Cordiali saluti,
Il Team di Supporto`);
};
