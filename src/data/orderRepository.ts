import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/data/firebase';
import { Order } from '@/data/order';

/**
 * Recupera gli ordini di un utente da Firestore
 */
export const fetchOrders = async (
    buyerId: string,
    addNotification?: (message: string, type: string) => void
): Promise<Order[]> => {
    const q = query(collection(db, 'orders'), where('buyerId', '==', buyerId));
    const querySnapshot = await getDocs(q);

    const ordersData: Order[] = [];

    for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();

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

        const productRef = doc(db, 'products', data.productId);
        const productDoc = await getDoc(productRef);
        const productData = productDoc.exists() ? productDoc.data() : null;

        if (productData) {
            ordersData.push({
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
                quantity: data.quantity || 1,
            });

            // Aggiungi notifica per prodotto venduto
            if (productData.sold) {
                addNotification?.(
                    `Il prodotto "${productData.name}" è stato venduto!`,
                    'success'
                );
            }
        }
    }

    return ordersData;
};