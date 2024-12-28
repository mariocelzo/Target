'use client';

import { useEffect, useState, useRef } from 'react';
import { doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface User {
    id: string;
    fullName: string;
    imageUrl: string;  // Cambiato 'avatar' con 'imageUrl'
}

interface Chat {
    id: string;
    buyerId: string;
    sellerId: string;
    messages: any[];
    createdAt: number;
    partnerName: string;
    partnerAvatar: string;
}

export default function ChatPage() {
    const [user, loadingUser] = useAuthState(auth);
    const [users, setUsers] = useState<User[]>([]);
    const [chat, setChat] = useState<Chat | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [leftPanelWidth, setLeftPanelWidth] = useState('300px'); // Imposta la larghezza iniziale del lato utenti

    const leftPanelRef = useRef<HTMLDivElement>(null);
    const resizeHandleRef = useRef<HTMLDivElement>(null);

    // Funzione per mantenere lo stato di login anche dopo un refresh
    useEffect(() => {
        const fetchUsers = async () => {
            if (!user) {
                setError('Utente non loggato');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Ottieni tutti gli utenti dalla collezione 'users'
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const usersList: User[] = [];

                usersSnapshot.forEach((docSnap) => {
                    const userData = docSnap.data();
                    if (userData.id !== user.uid) {
                        usersList.push({
                            id: docSnap.id,
                            fullName: userData.fullName || 'Nome Sconosciuto',
                            imageUrl: userData.imageUrl || '/default-avatar.png',  // Cambiato avatar con imageUrl
                        });
                    }
                });

                setUsers(usersList);
            } catch (err) {
                console.error('Errore durante il recupero degli utenti:', err);
                setError('Errore durante il recupero degli utenti.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchUsers();
        }
    }, [user]);

    // Funzione per creare o recuperare una chat
    const startChat = async (partnerId: string, partnerName: string, partnerImageUrl: string) => {
        if (!user) return;

        try {
            // Controlla se esiste già una chat con il partner
            const chatRef = collection(db, 'chats');
            const chatSnapshot = await getDocs(chatRef);
            let existingChat = null;

            chatSnapshot.forEach((docSnap) => {
                const chatData = docSnap.data();
                if (
                    (chatData.buyerId === user.uid && chatData.sellerId === partnerId) ||
                    (chatData.buyerId === partnerId && chatData.sellerId === user.uid)
                ) {
                    existingChat = { id: docSnap.id, ...chatData };
                }
            });

            if (existingChat) {
                // Se esiste, carica la chat esistente
                setChat(existingChat);
            } else {
                // Se non esiste, crea una nuova chat
                const newChatRef = await addDoc(collection(db, 'chats'), {
                    buyerId: user.uid,
                    sellerId: partnerId,
                    messages: [],
                    createdAt: Date.now(),
                });

                setChat({
                    id: newChatRef.id,
                    buyerId: user.uid,
                    sellerId: partnerId,
                    messages: [],
                    createdAt: Date.now(),
                    partnerName,
                    partnerAvatar: partnerImageUrl,
                });
            }
        } catch (err) {
            console.error('Errore durante la creazione della chat:', err);
            setError('Errore durante la creazione della chat.');
        }
    };

    // Funzione per inviare un messaggio
    const sendMessage = async () => {
        if (!message.trim()) {
            return; // Non inviare messaggio vuoto
        }

        if (!chat) {
            setError('Seleziona un utente per avviare la chat.');
            return;
        }

        setSending(true);
        try {
            // Aggiungi il messaggio alla chat
            await updateDoc(doc(db, 'chats', chat.id), {
                messages: [...chat.messages, { senderId: user?.uid, text: message, timestamp: Date.now() }],
            });
            // Aggiorna la chat
            setChat({
                ...chat,
                messages: [...chat.messages, { senderId: user?.uid, text: message, timestamp: Date.now() }],
            });
            setMessage('');
        } catch (err) {
            console.error('Errore durante l\'invio del messaggio:', err);
            setError('Errore durante l\'invio del messaggio.');
        } finally {
            setSending(false);
        }
    };

    // Funzione per monitorare lo stato dell'utente (Autenticazione persistente)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
            if (user) {
                // Se l'utente è loggato, aggiorna lo stato
                setError(null); // Reset errore
            } else {
                // Se l'utente non è loggato, reindirizza o gestisce l'errore
                setError('Utente non loggato');
            }
        });

        // Pulizia al momento dello smontaggio del componente
        return () => unsubscribe();
    }, []);

    // Listener in tempo reale per aggiornare la chat con i nuovi messaggi
    useEffect(() => {
        if (chat) {
            const unsubscribe = onSnapshot(doc(db, 'chats', chat.id), (docSnap) => {
                const updatedChat = docSnap.data();
                if (updatedChat) {
                    setChat({
                        id: chat.id,
                        buyerId: updatedChat.buyerId,
                        sellerId: updatedChat.sellerId,
                        messages: updatedChat.messages,
                        createdAt: updatedChat.createdAt,
                        partnerName: chat.partnerName,
                        partnerAvatar: chat.partnerAvatar,
                    });
                }
            });

            return () => unsubscribe();
        }
    }, [chat]);

    // Gestione resize pannello utenti
    const handleResize = (e: React.MouseEvent) => {
        if (leftPanelRef.current) {
            const deltaX = e.clientX - leftPanelRef.current.getBoundingClientRect().left;
            setLeftPanelWidth(`${deltaX}px`);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', handleResize);
        });
    };

    if (loadingUser) {
        return <div className="text-center">Caricamento...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <Header />

            <div className="flex-grow flex flex-col lg:flex-row">
                {/* Lista utenti */}
                <div
                    ref={leftPanelRef}
                    className="w-full lg:h-full p-4 bg-gray-50 border-r shadow-md"
                    style={{ width: leftPanelWidth }}
                >
                    <h2 className="text-2xl font-semibold mb-4">Utenti</h2>
                    <ul>
                        {users.map((user) => (
                            <li
                                key={user.id}
                                className="flex items-center justify-between p-3 mb-3 rounded-lg bg-white hover:bg-gray-200 cursor-pointer shadow-sm"
                                onClick={() => startChat(user.id, user.fullName, user.imageUrl)}
                            >
                                <img
                                    src={user.imageUrl || '/default-avatar.png'}
                                    alt={user.fullName}
                                    className="w-12 h-12 rounded-full"
                                />
                                <p className="ml-4 text-lg font-medium">{user.fullName}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Resize handle */}
                <div
                    ref={resizeHandleRef}
                    className="resize-handle hidden lg:block cursor-ew-resize"
                    onMouseDown={handleMouseDown}
                ></div>

                {/* Chat */}
                {chat && (
                    <div className="w-full lg:w-[calc(100%-2rem)] p-4 bg-white flex flex-col h-full">
                        <h2 className="text-3xl font-semibold mb-6">Chat con {chat.partnerName}</h2>
                        <div className="border p-4 mb-4 flex-grow overflow-y-auto bg-gray-100 rounded-lg h-96">
                            <ul>
                                {chat.messages.map((message, index) => (
                                    <li key={index} className={message.senderId === user?.uid ? 'text-right' : 'text-left'}>
                                        <div
                                            className={message.senderId === user?.uid ? 'bg-blue-100 p-3 rounded-lg inline-block' : 'bg-gray-300 p-3 rounded-lg inline-block'}
                                        >
                                            <p>{message.text}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex items-center mt-auto">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Scrivi un messaggio..."
                                className="w-full p-3 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={sending}
                                className={`ml-3 p-3 bg-blue-500 text-white rounded-r-md ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {sending ? 'Invio...' : 'Invia'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}