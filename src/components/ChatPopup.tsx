// components/ChatPopup.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
    collection,
    updateDoc,
    onSnapshot,
    doc,
    addDoc,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/data/firebase';
import { Input } from '@/components/ui/input';
import { UserCircle2, Send } from 'lucide-react';
import Toast from './Toast';  // Assicurati che il percorso sia corretto

interface Message {
    senderId: string;
    text: string;
    timestamp: number;
}

interface ChatMessage {
    id?: string;
    createdAt: number;
    messages: Message[];
    partnerAvatar: string;
    partnerId: string;
    partnerName: string;
    userId: string;
}

interface ChatPopupProps {
    productId: string;
    sellerId: string;
    sellerName: string;
    sellerAvatar?: string;
    onClose: () => void;
}

const ChatPopup: React.FC<ChatPopupProps> = ({
                                                 // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                 productId,
                                                 sellerId,
                                                 sellerName,
                                                 sellerAvatar,
                                                 onClose,
                                             }) => {
    const auth = getAuth();
    const [currentUser, setCurrentUser] = useState(auth.currentUser);
    const [chat, setChat] = useState<ChatMessage | null>(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [toasts, setToasts] = useState<string[]>([]);
    const lastMessageIdRef = useRef<string | null>(null);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) setCurrentUser(user);
        });
        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        if (!currentUser) return;

        const initChat = async () => {
            try {
                const messagesRef = collection(db, 'messages');
                const q = query(
                    messagesRef,
                    where('userId', 'in', [currentUser.uid, sellerId]),
                    where('partnerId', 'in', [currentUser.uid, sellerId])
                );

                const querySnapshot = await getDocs(q);
                let existingChat: ChatMessage | null = null;

                querySnapshot.forEach((docSnap) => {
                    const chatData = docSnap.data() as ChatMessage;
                    if (
                        (chatData.userId === currentUser.uid && chatData.partnerId === sellerId) ||
                        (chatData.userId === sellerId && chatData.partnerId === currentUser.uid)
                    ) {
                        existingChat = { ...chatData, id: docSnap.id };
                    }
                });

                if (existingChat) {
                    setChat(existingChat);
                } else {
                    const newChat: ChatMessage = {
                        createdAt: Date.now(),
                        messages: [],
                        partnerAvatar: sellerAvatar || '',
                        partnerId: sellerId,
                        partnerName: sellerName,
                        userId: currentUser.uid,
                    };
                    const docRef = await addDoc(messagesRef, newChat);
                    setChat({ ...newChat, id: docRef.id });
                }
            } catch (err) {
                console.error('Error initializing chat:', err);
            }
        };

        initChat();
    }, [currentUser, sellerId, sellerName, sellerAvatar]);

       useEffect(() => {
                if (!currentUser || !chat?.id) return;
                const messagesRef = collection(db, 'messages');
                const unsubscribe = onSnapshot(doc(messagesRef, chat.id), (docSnap) => {
                        if (docSnap.exists()) {
                                const updatedChat = {
                                        id: docSnap.id,
                                        ...docSnap.data(),
                                    } as ChatMessage;

                                   // Controlla se c'è un nuovo messaggio
                                       const messages = updatedChat.messages || [];
                                if (messages.length > 0) {
                                       const lastMsg = messages[messages.length - 1];
                                        // Se il messaggio è nuovo e non inviato dall'utente corrente
                                            if (
                                                lastMsg &&
                                                lastMsg.senderId !== currentUser.uid &&
                                                lastMsg.timestamp.toString() !== lastMessageIdRef.current
                                            ) {
                                                lastMessageIdRef.current = lastMsg.timestamp.toString();
                                                setToasts((prev) => [`Nuovo messaggio da ${updatedChat.partnerName}`, ...prev]);
                                            }
                                    }

                                   setChat(updatedChat);
                           }
                    });
                return () => unsubscribe();
            }, [currentUser, chat?.id]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !chat || !currentUser) return;
        setSending(true);
        try {
            const newMessage: Message = {
                senderId: currentUser.uid,
                text: message,
                timestamp: Date.now(),
            };
            const messagesRef = collection(db, 'messages');
            await updateDoc(doc(messagesRef, chat.id), {
                messages: [...(chat.messages || []), newMessage],
            });
            setMessage('');
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center bg-black bg-opacity-50 pt-20">
            {/* Container per i Toast */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[1100]">
                {toasts.map((msg, index) => (
                <Toast
                    key={index}
                    message={msg}
                    onClose={() =>
                        setToasts((prev) => prev.filter((_, i) => i !== index))
                }
                />
                ))}
            </div>
            <div className="bg-white w-full max-w-md h-[500px] rounded-lg shadow-lg flex flex-col">
                {/* Header fisso */}
                <div className="flex items-center justify-between p-4 bg-teal-500 text-white rounded-t-lg">
                    <div className="flex items-center space-x-3">
                        {sellerAvatar ? (
                            <img src={sellerAvatar} alt={sellerName} className="w-10 h-10 rounded-full"/>
                        ) : (
                            <UserCircle2 className="w-10 h-10"/>
                        )}
                        <h2 className="text-xl font-semibold">{sellerName}</h2>
                    </div>
                    <button onClick={onClose} className="text-white font-bold text-xl">✕</button>
                </div>

                {/* Area messaggi scrollabile */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {chat?.messages?.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            <div
                                className={`max-w-[70%] p-3 rounded-lg ${
                                    msg.senderId === currentUser?.uid
                                        ? 'bg-teal-500 text-white'
                                        : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef}/>
                </div>

                {/* Input di invio messaggi */}
                <div className="p-4 border-t border-gray-200">
                    <form className="flex items-center space-x-2" onSubmit={sendMessage}>
                        <Input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Scrivi un messaggio..."
                            className="flex-grow"
                        />
                        <button
                            type="submit"
                            disabled={sending}
                            className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition duration-200 disabled:opacity-50"
                        >
                            <Send size={20}/>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPopup;