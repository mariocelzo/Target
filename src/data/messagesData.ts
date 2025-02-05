export interface Message {
    senderId: string;
    text: string;
    timestamp: number;
}

export interface ChatMessage {
    id?: string;
    createdAt: number;
    messages: Message[];
    partnerAvatar: string;
    partnerId: string;
    partnerName: string;
    userId: string;
}

export interface User {
    id: string;
    fullName: string;
    imageUrl?: string;
}
