import apiClient from './axiosConfig';
import type { ChatMessage } from '../types/chat';

// --- THIS IS THE FIX ---
// The endpoint now correctly points to /conversations/{id}/history
export const getChatHistory = async (conversationId: number): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(`/conversations/${conversationId}/history`);
    return response.data;
};
// --------------------