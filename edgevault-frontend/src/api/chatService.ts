import apiClient from './axiosConfig';
import type { ChatMessage, Conversation } from '../types/chat';

export const getChatHistory = async (conversationId: number): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(`/conversations/${conversationId}/history`);
    return response.data;
};

export const getDocumentConversation = async (documentId: number): Promise<Conversation> => {
    const response = await apiClient.get<Conversation>(`/documents/${documentId}/conversation`);
    return response.data;
};