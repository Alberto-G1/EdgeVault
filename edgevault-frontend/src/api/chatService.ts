import apiClient from './axiosConfig';
import type { ChatMessage, Conversation, ConversationSummary, UserPresence } from '../types/chat';
import type { User } from '../types/user';

export const getChatHistory = async (conversationId: number): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(`/conversations/${conversationId}/history`);
    return response.data;
};

export const getDocumentConversation = async (documentId: number): Promise<Conversation> => {
    const response = await apiClient.get<Conversation>(`/documents/${documentId}/conversation`);
    return response.data;
};

export const getAllConversations = async (): Promise<ConversationSummary[]> => {
    const response = await apiClient.get<ConversationSummary[]>('/conversations');
    return response.data;
};

export const getGroupConversation = async (): Promise<Conversation> => {
    const response = await apiClient.get<Conversation>('/conversations/group');
    return response.data;
};

export const markConversationAsRead = async (conversationId: number): Promise<void> => {
    await apiClient.post(`/conversations/${conversationId}/read`);
};

export const getTotalUnreadCount = async (): Promise<number> => {
    const response = await apiClient.get<number>('/conversations/unread-count');
    return response.data;
};

export const searchUsers = async (query: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/search', { params: { query } });
    return response.data;
};

export const startDirectMessage = async (withUser: string): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>('/conversations/dm', null, {
        params: { withUser }
    });
    return response.data;
};

export const getAllUserPresences = async (): Promise<UserPresence[]> => {
    const response = await apiClient.get<UserPresence[]>('/users/presence');
    return response.data;
};