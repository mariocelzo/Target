'use client';

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    onSnapshot,
    doc,
    query,
    where,
} from 'firebase/firestore';
import {
    getAuth,
    onAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/data/firebase';
import { Input } from '@/components/ui/input';
import { UserCircle2, Send } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

interface User {
    id: string;
    fullName: string;
    imageUrl?: string;
    lastMessageTimestamp?: number; // <--- nuovo campo
}

const ChatScreen = () => {
    const auth = getAuth();
    const router = useRouter();

    // Stato dell'utente attualmente loggato.
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);

    // Lista principale di utenti con cui ho già chattato (ordinata per ultimo messaggio).
    const [chattedUsers, setChattedUsers] = useState<User[]>([]);

    // Lista di tutti gli utenti (usata per la ricerca).
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // Chat selezionata dall’utente.
    const [chat, setChat] = useState<ChatMessage | null>(null);

    // Messaggio da inviare.
    const [message, setMessage] = useState('');

    // Stato di invio del messaggio.
    const [sending, setSending] = useState(false);

    // Errori vari.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState('');

    // Testo di ricerca.
    const [searchTerm, setSearchTerm] = useState('');

    // Riferimenti per la UI.
    const leftPanelRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [leftPanelWidth, setLeftPanelWidth] = useState('300px');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Per tenere in memoria le chat in cui currentUser è userId e quelle in cui è partnerId.
    const [myChatsAsUser, setMyChatsAsUser] = useState<ChatMessage[]>([]);
    const [myChatsAsPartner, setMyChatsAsPartner] = useState<ChatMessage[]>([]);

    /**
     * Verifica autenticazione.
     */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [auth, router]);

    /**
     * Carica TUTTI gli utenti (per la ricerca).
     */
    useEffect(() => {
        if (!currentUser) return;

        const fetchAllUsers = async () => {
            try {
                const usersRef = collection(db, 'users');
                const querySnapshot = await getDocs(usersRef);
                const usersList: User[] = [];
                querySnapshot.forEach((userDoc) => {
                    const userData = userDoc.data();
                    // Salta l'utente corrente
                    if (userDoc.id !== currentUser.uid) {
                        usersList.push({
                            id: userDoc.id,
                            fullName: userData.fullName,
                            imageUrl: userData.imageUrl,
                        });
                    }
                });

                setAllUsers(usersList);
            } catch (err) {
                console.error('Error fetching all users:', err);
                setError('Error loading users');
            }
        };

        fetchAllUsers();
    }, [currentUser]);

    /**
     * Sottoscrizione in tempo reale alle chat in cui currentUser è userId.
     */
    useEffect(() => {
        if (!currentUser) return;

        const messagesRef = collection(db, 'messages');
        const q1 = query(messagesRef, where('userId', '==', currentUser.uid));

        const unsubscribe = onSnapshot(q1, (snapshot) => {
            const chats: ChatMessage[] = [];
            snapshot.forEach((docSnap) => {
                chats.push({ id: docSnap.id, ...(docSnap.data() as ChatMessage) });
            });
            setMyChatsAsUser(chats);
        });

        return () => unsubscribe();
    }, [currentUser]);

    /**
     * Sottoscrizione in tempo reale alle chat in cui currentUser è partnerId.
     */
    useEffect(() => {
        if (!currentUser) return;

        const messagesRef = collection(db, 'messages');
        const q2 = query(messagesRef, where('partnerId', '==', currentUser.uid));

        const unsubscribe = onSnapshot(q2, (snapshot) => {
            const chats: ChatMessage[] = [];
            snapshot.forEach((docSnap) => {
                chats.push({ id: docSnap.id, ...(docSnap.data() as ChatMessage) });
            });
            setMyChatsAsPartner(chats);
        });

        return () => unsubscribe();
    }, [currentUser]);

    /**
     * Unisce le chat raccolte dalle due sottoscrizioni e aggiorna chattedUsers
     * ordinando per timestamp dell'ultimo messaggio (decrescente).
     */
    useEffect(() => {
        if (!currentUser) return;

        // Unisco le chat in un unico array
        const allChats: ChatMessage[] = [...myChatsAsUser, ...myChatsAsPartner];

        // Calcoliamo l'ultimo messaggio di ciascun partner
        const partnerIds = new Set<string>();
        const partnerLastMsg: Record<string, number> = {};

        allChats.forEach((chat) => {
            const { messages } = chat;
            if (!messages || messages.length === 0) return;

            // Trova l'ultimo messaggio via sort
            const sortedByTimestamp = [...messages].sort(
                (a, b) => b.timestamp - a.timestamp
            );
            const lastTimestamp = sortedByTimestamp[0].timestamp;

            // Se userId è l'utente corrente, l'altro è partnerId, altrimenti è userId
            let otherUserId = chat.partnerId;
            if (chat.userId !== currentUser.uid) {
                otherUserId = chat.userId;
            }

            partnerIds.add(otherUserId);

            // Salva il timestamp più recente per questo partner
            if (
                !partnerLastMsg[otherUserId] ||
                partnerLastMsg[otherUserId] < lastTimestamp
            ) {
                partnerLastMsg[otherUserId] = lastTimestamp;
            }
        });

        // Ora recuperiamo i dati di questi partner dalla collezione chattedUsers stessa
        // (oppure potremmo rifare una query su "users", ma di solito li hai già in allUsers)
        // In questo esempio, useremo "allUsers" per recuperare i dati.
        const chattedUsersArray: User[] = [];
        partnerIds.forEach((pid) => {
            // Cerchiamo l'utente in allUsers
            const userData = allUsers.find((u) => u.id === pid);
            if (userData) {
                chattedUsersArray.push({
                    ...userData,
                    lastMessageTimestamp: partnerLastMsg[pid] ?? 0,
                });
            }
        });

        // Ordino per timestamp discendente
        chattedUsersArray.sort((a, b) => {
            return (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0);
        });

        setChattedUsers(chattedUsersArray);
    }, [myChatsAsUser, myChatsAsPartner, allUsers, currentUser]);

    /**
     * Avvia o recupera una chat con lo user selezionato.
     */
    const startChat = async (
        partnerId: string,
        partnerName: string,
        partnerAvatar: string
    ) => {
        if (!currentUser) return;

        try {
            const messagesRef = collection(db, 'messages');
            const q = query(
                messagesRef,
                where('userId', 'in', [currentUser.uid, partnerId]),
                where('partnerId', 'in', [currentUser.uid, partnerId])
            );

            const querySnapshot = await getDocs(q);
            let existingChat: ChatMessage | null = null;

            querySnapshot.forEach((docSnap) => {
                const chatData = docSnap.data() as ChatMessage;
                // Controlliamo la corrispondenza esatta
                if (
                    (chatData.userId === currentUser.uid &&
                        chatData.partnerId === partnerId) ||
                    (chatData.userId === partnerId &&
                        chatData.partnerId === currentUser.uid)
                ) {
                    existingChat = { ...chatData, id: docSnap.id };
                }
            });

            if (existingChat) {
                setChat(existingChat);
            } else {
                const newChat: ChatMessage = {
                    id: '',
                    createdAt: Date.now(),
                    messages: [],
                    partnerAvatar,
                    partnerId,
                    partnerName,
                    userId: currentUser.uid,
                };

                const docRef = await addDoc(messagesRef, newChat);
                setChat({ ...newChat, id: docRef.id });
            }
        } catch (err) {
            console.error('Error starting chat:', err);
            setError('Error starting chat');
        }
    };

    /**
     * Ascolta in tempo reale la chat corrente (i suoi messaggi),
     * così si aggiorna immediatamente appena arriva qualcosa.
     */
    useEffect(() => {
        if (!currentUser || !chat?.id) return;

        const messagesRef = collection(db, 'messages');
        const unsubscribe = onSnapshot(doc(messagesRef, chat.id), (docSnap) => {
            if (docSnap.exists()) {
                const updatedChat = {
                    id: docSnap.id,
                    ...docSnap.data(),
                } as ChatMessage;
                setChat(updatedChat);
            }
        });

        return () => unsubscribe();
    }, [currentUser, chat?.id]);

    /**
     * Invio del messaggio.
     */
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
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Error sending message');
        } finally {
            setSending(false);
        }
    };

    /**
     * Filtraggio: se `searchTerm` è vuoto -> chattedUsers (ordinati),
     * altrimenti allUsers che matchano la ricerca.
     */
    const filteredUsers = searchTerm.trim()
        ? allUsers.filter((user) =>
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : chattedUsers;

    // Se l'utente non è loggato, mostro un messaggio.
    if (!currentUser) {
        return <div className="text-center">Please log in to continue</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header />

            <div className="flex-grow flex">
                {/* Sidebar con la lista utenti */}
                <div
                    ref={leftPanelRef}
                    className="w-[300px] bg-white min-h-full border-r border-gray-200 shadow-md"
                    style={{ width: leftPanelWidth }}
                >
                    <div className="p-4">
                        <Input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mb-4"
                        />
                        <div className="space-y-2">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        startChat(user.id, user.fullName, user.imageUrl || '');
                                    }}
                                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition duration-200"
                                >
                                    {user.imageUrl ? (
                                        <img
                                            src={user.imageUrl}
                                            alt={user.fullName}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <UserCircle2 className="w-10 h-10 text-gray-400" />
                                    )}
                                    <span className="font-medium">{user.fullName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Area principale della chat */}
                <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg m-4">
                    {chat ? (
                        <>
                            {/* Header della chat */}
                            <div className="flex items-center space-x-4 p-4 border-b border-gray-200 bg-teal-500 text-white rounded-t-lg">
                                {chat.partnerAvatar ? (
                                    <img
                                        src={chat.partnerAvatar}
                                        alt={chat.partnerName}
                                        className="w-10 h-10 rounded-full border-2 border-white"
                                    />
                                ) : (
                                    <UserCircle2 className="w-10 h-10 text-white" />
                                )}
                                <h2 className="text-xl font-semibold">{chat.partnerName}</h2>
                            </div>

                            {/* Lista messaggi */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {chat.messages?.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${
                                            msg.senderId === currentUser.uid
                                                ? 'justify-end'
                                                : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[70%] p-3 rounded-lg ${
                                                msg.senderId === currentUser.uid
                                                    ? 'bg-teal-500 text-white'
                                                    : 'bg-gray-200 text-gray-800'
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {/* Ancora per scroll all'ultimo messaggio */}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input di invio messaggi */}
                            <div className="p-4 border-t border-gray-200">
                                <form className="flex items-center space-x-2" onSubmit={sendMessage}>
                                    <Input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-grow"
                                        onFocus={(e) => e.stopPropagation()}
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition duration-200 disabled:opacity-50"
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select a user to start chatting
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ChatScreen;
