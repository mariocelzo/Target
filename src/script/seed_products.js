// src/script/seed_products.js

import admin from 'firebase-admin';
import { faker } from '@faker-js/faker';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Determina il percorso del file corrente per costruire percorsi relativi
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leggi e parsifica il file JSON delle credenziali
const serviceAccountPath = join(__dirname, 'target-8b44c-firebase-adminsdk-os9pa-766161f9cc.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

// Inizializza l'SDK Admin di Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Liste di possibili valori
const categories = ["Moda", "Elettronica", "Arredamento", "Auto e Moto"];
const conditions = ["Nuovo", "Usato", "Ricondizionato"];

/**
 * Recupera tutti i docId dalla collezione 'users'.
 * Restituisce un array di ID (stringhe).
 */
async function getAllUserIds() {
    const snapshot = await db.collection('users').get();

    // Se non ci sono utenti, restituiamo un array vuoto
    if (snapshot.empty) {
        console.warn("Nessun utente trovato nella collezione 'users'. L'array userIds sarà vuoto.");
        return [];
    }

    const userIds = [];
    snapshot.forEach(doc => {
        userIds.push(doc.id);
    });
    return userIds;
}

/**
 * Genera un oggetto "prodotto" fittizio,
 * selezionando userId in modo casuale dall'array di ID utenti.
 */
function generateFakeProduct(userIds) {
    return {
        category: faker.helpers.arrayElement(categories),
        condition: faker.helpers.arrayElement(conditions),
        createdAt: admin.firestore.Timestamp.fromDate(new Date()),
        description: faker.lorem.paragraph(),
        image: faker.image.urlPicsumPhotos({ width: 640, height: 480 }),
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price()),
        sold: false,
        userId: userIds.length > 0
            ? faker.helpers.arrayElement(userIds)
            : "dummyUserId"   // nel caso in cui non ci siano utenti
    };
}

/**
 * Crea in batch n prodotti,
 * assegnando un userId esistente dalla collezione 'users'.
 */
async function createFakeProducts(n) {
    // 1. Recuperiamo tutti gli ID degli utenti
    const userIds = await getAllUserIds();

    // 2. Creiamo un batch e generiamo i prodotti
    const batch = db.batch();
    const productsCollection = db.collection('products');

    for (let i = 0; i < n; i++) {
        const newProductRef = productsCollection.doc();
        const productData = generateFakeProduct(userIds);
        batch.set(newProductRef, productData);
    }

    // 3. Salviamo in Firestore
    try {
        await batch.commit();
        console.log(`${n} prodotti fittizi creati.`);
    } catch (error) {
        console.error("Errore durante la creazione dei prodotti:", error);
    }
}

// Eseguo la funzione creando, ad esempio, 20 prodotti
createFakeProducts(20).then(() => {
    console.log("Operazione di seeding (products) completata.");
    process.exit();
});