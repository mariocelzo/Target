// src/data/ordersData.ts

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/data/firebase';

export const fetchOrdersByBuyerId = async (buyerId: string) => {
    const q = query(collection(db, 'orders'), where('buyerId', '==', buyerId));
    const querySnapshot = await getDocs(q);
    const ordersData = [];

    for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();

        // Verifica se createdAt esiste e può essere convertito
        let createdAtFormatted = 'Data non disponibile';
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdAtFormatted = data.createdAt.toDate().toLocaleString('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        }

        // Recupera i dettagli del prodotto
        const productRef = doc(db, 'products', data.productId);
        const productDoc = await getDoc(productRef);
        const productData = productDoc.exists() ? productDoc.data() : null;

        if (productData) {
            const order = {
                id: docSnapshot.id,
                productName: productData.name,
                price: Number(productData.price),
                createdAt: createdAtFormatted,
                productDetails: {
                    name: productData.name,
                    description: productData.description,
                    price: Number(productData.price),
                    image: productData.image || '/placeholder.png',
                    category: productData.category,
                    condition: productData.condition,
                    sold: productData.sold,
                },
                quantity: data.quantity || 1, // Default a 1 se non esiste
            };

            ordersData.push(order);
        }
    }

    return ordersData;
};
