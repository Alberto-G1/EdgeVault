export interface ChatMessage {
    id: number;
    conversationId: number;
    senderUsername: string;
    senderProfilePictureUrl?: string;
    content: string;
    timestamp: string;
}

export interface Conversation {
    id: number;
    name?: string;
    type: 'DIRECT_MESSAGE' | 'GROUP' | 'DOCUMENT';
    documentId?: number;
    createdAt: string;
}