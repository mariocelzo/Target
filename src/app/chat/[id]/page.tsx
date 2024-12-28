'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useParams } from 'next/navigation';

interface Message {
    senderId: string;
    text: string;
    timestamp: number;
    read: boolean;
}

interface Chat {
    id: string;
    productId: string;
    buyerId: string;
    sellerId: string;
    messages: Message[];
    createdAt: number;
}

export default function ChatPage() {
    const router = useRouter();
    const { chatId } = useParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [chat, setChat] = useState<Chat | null>(null);

    useEffect(() => {
        if (!chatId) return;

        const fetchChat = async () => {
            setLoading(true);
            try {
                const chatRef = doc(db, 'chats', String(chatId));
                const chatSnap = await getDoc(chatRef);

                if (chatSnap.exists()) {
                    const chatData = chatSnap.data();
                    const fetchedChat: Chat = {
                        id: chatSnap.id,
                        productId: chatData.productId,
                        buyerId: chatData.buyerId,
                        sellerId: chatData.sellerId,
                        messages: chatData.messages || [],
                        createdAt: chatData.createdAt,
                    };
                    setChat(fetchedChat);
                    setMessages(fetchedChat.messages);

                    // Ascolta i cambiamenti in tempo reale dei messaggi
                    onSnapshot(chatRef, (snapshot) => {
                        if (snapshot.exists()) {
                            setMessages(snapshot.data()?.messages || []);
                        }
                    });
                }
            } catch (err) {
                setError('Errore nel recupero della chat.');
            } finally {
                setLoading(false);
            }
        };

        fetchChat();
    }, [chatId]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user) return;

        const message: Message = {
            senderId: user.uid,
            text: newMessage,
            timestamp: Date.now(),
            read: false, // Imposta il messaggio come non letto
        };

        setLoading(true); // Imposta lo stato di caricamento mentre il messaggio viene inviato

        try {
            const chatRef = doc(db, 'chats', String(chatId));
            await updateDoc(chatRef, {
                messages: [...messages, message],
            });

            // Aggiungi il messaggio localmente
            setMessages((prevMessages) => [...prevMessages, message]);
            setNewMessage('');
        } catch (err) {
            setError('Errore nell\'invio del messaggio.');
        } finally {
            setLoading(false); // Disabilita lo stato di caricamento dopo l'invio
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
        // Aggiorna il campo "read" per il messaggio specifico
        const updatedMessages = messages.map((message) => {
            if (message.senderId !== user?.uid && !message.read) {
                message.read = true;
            }
            return message;
        });

        const chatRef = doc(db, 'chats', String(chatId));
        await updateDoc(chatRef, {
            messages: updatedMessages,
        });
        setMessages(updatedMessages);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-600">Caricamento chat...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <section className="container mx-auto py-8 px-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-md max-w-2xl mx-auto">
                    <div className="p-4">
                        <h3 className="text-lg font-bold mb-4">Messaggi</h3>
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                                    onClick={() => handleMarkAsRead(message.senderId)}
                                >
                                    <div
                                        className={`bg-gray-200 p-3 rounded-lg max-w-xs ${
                                            message.senderId === user?.uid ? 'bg-blue-500 text-white' : 'bg-gray-300'
                                        }`}
                                    >
                                        <p>{message.text}</p>
                                        <span className="text-xs text-gray-500">
                                            {message.read ? 'Letto' : 'Non letto'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex">
                            <input
                                type="text"
                                className="border border-gray-300 rounded-l-lg p-2 w-full"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Scrivi un messaggio..."
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-blue-500 text-white rounded-r-lg p-2 hover:bg-blue-600"
                                disabled={loading}
                            >
                                {loading ? 'Inviando...' : 'Invia'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}