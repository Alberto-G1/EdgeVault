export interface ChatMessage {
    id: number;
    documentId: number;
    senderUsername: string;
    senderProfilePictureUrl?: string;
    content: string;
    timestamp: string;
}