import { getCurrentUser } from '@/services/authService';
import { fetchOrders } from '@/data/orderRepository';
import { Order } from '@/types/order';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/data/firebase';

export const getUserOrders = async (): Promise<{ orders: Order[]; error: string | null }> => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return {
            orders: [],
            error: "Per favore, effettua l'accesso per visualizzare i tuoi ordini.",
        };
    }

    try {
        const orders = await fetchOrders(currentUser.uid);
        if (orders.length === 0) {
            return {
                orders: [],
                error: 'Non hai ancora effettuato alcun ordine. Inizia a fare acquisti!',
            };
        }
        return {
            orders,
            error: null,
        };
    } catch (err) {
        console.error('Errore nel service:', err);
        return {
            orders: [],
            error: 'Si è verificato un errore durante il recupero degli ordini. Riprova più tardi.',
        };
    }
};

/**
 * Gestisce il pagamento tramite Google Pay
 * @param productId ID del prodotto
 * @param price Prezzo del prodotto
 * @param currency Codice della valuta (es. 'EUR')
 */
export const handleGooglePayClick = async (productId: string, price: number, currency: string): Promise<{ success: boolean; error: string | null }> => {
    const paymentsClient = new google.payments.api.PaymentsClient({
        environment: 'TEST', // Cambiare in 'PRODUCTION' per l'ambiente reale
    });

    const paymentRequest: google.payments.api.PaymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['MASTERCARD', 'VISA'],
            },
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                    gateway: 'example',
                    gatewayMerchantId: 'exampleMerchantId',
                },
            },
        }],
        transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: price.toString(),
            currencyCode: currency,
        },
        merchantInfo: {
            merchantName: 'E-commerce Store',
            merchantId: '0123456789', // Aggiunto merchantId obbligatorio
        },
    };

    try {
        const paymentData = await paymentsClient.loadPaymentData(paymentRequest);

        // Dopo il pagamento completato, salva l'ordine
        const ordersRef = collection(db, 'orders');
        await addDoc(ordersRef, {
            productId,
            price,
            currency,
            createdAt: serverTimestamp(),
            status: 'completed',
        });

        // Aggiorna lo stato del prodotto come "venduto"
        await updateDoc(doc(db, 'products', productId), { sold: true });

        console.log('Pagamento completato:', paymentData);
        return { success: true, error: null };
    } catch (err) {
        console.error('Errore durante il pagamento:', err);
        return { success: false, error: 'Pagamento fallito. Riprova.' };
    }
};

