'use client';

import { collection, getDocs, addDoc, updateDoc, onSnapshot, doc, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { Input } from "@/components/ui/input";
import { UserCircle2, Send } from 'lucide-react';
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

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
}

const ChatScreen = () => {
    const auth = getAuth();
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(auth.currentUser);
    const [users, setUsers] = useState<User[]>([]);
    const [chat, setChat] = useState<ChatMessage | null>(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const leftPanelRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [leftPanelWidth, setLeftPanelWidth] = useState('300px');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                router.push('/login'); // Reindirizza alla pagina di login se non autenticato
            }
        });

        return () => unsubscribe();
    }, [auth, router]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!currentUser) return;

            try {
                const usersRef = collection(db, 'users');
                const querySnapshot = await getDocs(usersRef);
                const usersList: User[] = [];

                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    if (doc.id !== currentUser.uid) {
                        usersList.push({
                            id: doc.id,
                            fullName: userData.fullName,
                            imageUrl: userData.imageUrl
                        });
                    }
                });

                setUsers(usersList);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Error loading users');
            }
        };

        fetchUsers();
    }, [currentUser]);

    const startChat = async (partnerId: string, partnerName: string, partnerAvatar: string) => {
        if (!currentUser) return;

        try {
            const messagesRef = collection(db, 'messages');
            const q = query(messagesRef,
                where('userId', 'in', [currentUser.uid, partnerId]),
                where('partnerId', 'in', [currentUser.uid, partnerId])
            );

            const querySnapshot = await getDocs(q);
            let existingChat = null;

            querySnapshot.forEach((doc) => {
                const chatData = doc.data() as ChatMessage;
                if ((chatData.userId === currentUser.uid && chatData.partnerId === partnerId) ||
                    (chatData.userId === partnerId && chatData.partnerId === currentUser.uid)) {
                    existingChat = { ...chatData, id: doc.id };
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
                    userId: currentUser.uid
                };

                const docRef = await addDoc(collection(db, 'messages'), newChat);
                setChat({ ...newChat, id: docRef.id });
            }
        } catch (err) {
            console.error('Error starting chat:', err);
            setError('Error starting chat');
        }
    };

    useEffect(() => {
        if (!currentUser || !chat?.id) return;

        const messagesRef = collection(db, 'messages');
        const unsubscribe = onSnapshot(doc(messagesRef, chat.id), (docSnap) => {
            if (docSnap.exists()) {
                const updatedChat = { id: docSnap.id, ...docSnap.data() } as ChatMessage;
                setChat(updatedChat);
            }
        });

        return () => unsubscribe();
    }, [currentUser, chat?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault(); // Previene lo scroll indesiderato
        if (!message.trim() || !chat || !currentUser) return;

        setSending(true);
        try {
            const newMessage: Message = {
                senderId: currentUser.uid,
                text: message,
                timestamp: Date.now()
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

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!currentUser) {
        return <div className="text-center">Please log in to continue</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header />
            <div className="flex-grow flex">
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

                <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg m-4">
                    {chat ? (
                        <>
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

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {chat.messages?.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
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
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 border-t border-gray-200">
                                <form className="flex items-center space-x-2" onSubmit={sendMessage}>
                                    <Input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-grow"
                                        onFocus={(e) => e.stopPropagation()} // Prevenzione di focus scroll
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