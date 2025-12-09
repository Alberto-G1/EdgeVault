import apiClient from './axiosConfig';
import type { Notification } from '../context/NotificationContext';

export const getNotificationsForUser = async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/notifications');
    return response.data;
};

export const getUnreadNotificationCount = async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data;
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`);
};