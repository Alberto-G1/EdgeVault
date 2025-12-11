export interface ChatMessage {
    id: number;
    conversationId: number;
    senderUsername: string;
    senderProfilePictureUrl?: string;
    content: string;
    timestamp: string;
    readCount: number;
    totalRecipients: number;
}

export interface Conversation {
    id: number;
    name?: string;
    type: 'DIRECT_MESSAGE' | 'GROUP' | 'DOCUMENT';
    documentId?: number;
    createdAt: string;
}

export interface ConversationSummary {
    id: number;
    name?: string;
    type: string;
    documentId?: number;
    lastMessage?: string;
    lastMessageTime?: string;
    lastMessageSender?: string;
    unreadCount: number;
    otherParticipantUsername?: string;
    otherParticipantProfilePicture?: string;
}

export interface TypingIndicator {
    username: string;
    typing: boolean;
}

export interface UserPresence {
    userId: number;
    username: string;
    status: 'ONLINE' | 'OFFLINE';
    lastSeen?: string;
}