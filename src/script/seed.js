// src/script/seed_users.js (o seed.js) - Aggiorna il percorso se necessario

import admin from 'firebase-admin';
import { faker } from '@faker-js/faker';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Determina il percorso del file corrente per costruire percorsi relativi
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leggi e parsifica il file JSON delle credenziali
// Assicurati che il file JSON sia presente nel percorso corretto
const serviceAccountPath = join(__dirname, 'target-8b44c-firebase-adminsdk-os9pa-766161f9cc.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

// Inizializza l'SDK Admin di Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Funzione per generare un utente fittizio secondo lo schema richiesto
function generateFakeUser() {
    return {
        address: faker.address.streetAddress(),    // Indirizzo casuale
        bio: faker.lorem.sentence(),              // Bio casuale
        city: faker.address.city(),               // Città casuale
        createdAt: admin.firestore.Timestamp.fromDate(new Date()),
        dateOfBirth: faker.date.birthdate({ mode: 'year', min: 1950, max: 2010 })
            .toISOString()
            .split('T')[0],            // Converte la data in formato YYYY-MM-DD
        email: faker.internet.email(),            // Email casuale
        fullName: faker.name.fullName(),          // Nome completo casuale
        imageUrl: faker.image.avatar(),           // URL di un avatar casuale
        phoneNumber: faker.phone.number('##########'), // Numero di telefono casuale
        province: faker.address.state(),          // Provincia/stato casuale
        zipCode: faker.address.zipCode('#####')    // CAP casuale
    };
}

// Funzione per creare in batch un certo numero di utenti
async function createFakeUsers(n) {
    const batch = db.batch();
    const usersCollection = db.collection('users');

    for (let i = 0; i < n; i++) {
        const newUserRef = usersCollection.doc(); // Crea un riferimento ad un nuovo documento con ID automatico
        const userData = generateFakeUser();
        batch.set(newUserRef, userData);
    }

    try {
        await batch.commit();
        console.log(`${n} utenti fittizi creati.`);
    } catch (error) {
        console.error("Errore durante la creazione degli utenti:", error);
    }
}

// Specifica quanti utenti vuoi creare, ad esempio 50
createFakeUsers(50).then(() => {
    console.log("Operazione di seeding completata.");
    process.exit();
});