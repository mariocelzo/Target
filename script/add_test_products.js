// Simple script to add test products to Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase config (same as your app)
const firebaseConfig = {
    apiKey: "AIzaSyA7MbVeT2iRfr5K2St2YqGp9bYrv1rgBIE",
    authDomain: "target-8b44c.firebaseapp.com",
    projectId: "target-8b44c",
    storageBucket: "target-8b44c.appspot.com",
    messagingSenderId: "17450701981",
    appId: "1:17450701981:web:7611318f79bdf630dd7074",
    measurementId: "G-NEE9CYPC64"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test products data
const testProducts = [
    {
        name: "iPhone 13 Pro",
        description: "Smartphone Apple in ottime condizioni, schermo 6.1 pollici, 128GB",
        price: 699.99,
        category: "Elettronica",
        condition: "Usato",
        sold: false,
        userId: "test-user-1",
        image: "https://picsum.photos/400/300?random=1",
        createdAt: new Date()
    },
    {
        name: "Sofa Moderno",
        description: "Divano 3 posti in pelle sintetica, colore grigio, perfetto per salotto",
        price: 450.00,
        category: "Arredamento",
        condition: "Nuovo",
        sold: false,
        userId: "test-user-2",
        image: "https://picsum.photos/400/300?random=2",
        createdAt: new Date()
    },
    {
        name: "Nike Air Max",
        description: "Scarpe da running Nike Air Max, taglia 42, colore bianco/nero",
        price: 89.99,
        category: "Moda",
        condition: "Nuovo",
        sold: false,
        userId: "test-user-3",
        image: "https://picsum.photos/400/300?random=3",
        createdAt: new Date()
    },
    {
        name: "Honda Civic 2019",
        description: "Auto usata in ottime condizioni, 50.000 km, benzina, cambio manuale",
        price: 18500.00,
        category: "Auto e Moto",
        condition: "Usato",
        sold: false,
        userId: "test-user-4",
        image: "https://picsum.photos/400/300?random=4",
        createdAt: new Date()
    },
    {
        name: "MacBook Air M1",
        description: "Laptop Apple con chip M1, 8GB RAM, 256GB SSD, perfetto per lavoro",
        price: 999.99,
        category: "Elettronica",
        condition: "Usato",
        sold: false,
        userId: "test-user-5",
        image: "https://picsum.photos/400/300?random=5",
        createdAt: new Date()
    }
];

// Function to add products
async function addTestProducts() {
    try {
        console.log('Adding test products...');
        
        for (const product of testProducts) {
            const docRef = await addDoc(collection(db, 'products'), product);
            console.log(`Product added with ID: ${docRef.id}`);
        }
        
        console.log('All test products added successfully!');
    } catch (error) {
        console.error('Error adding products:', error);
    }
}

// Run the function
addTestProducts();
