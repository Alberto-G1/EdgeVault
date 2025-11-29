import apiClient from './axiosConfig';
import type { ChatMessage } from '../types/chat';

export const getChatHistory = async (documentId: number): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(`/documents/${documentId}/chat-history`);
    return response.data;
};