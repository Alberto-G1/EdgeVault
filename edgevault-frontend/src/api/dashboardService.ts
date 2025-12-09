import apiClient from './axiosConfig';
import type { StatCard, RecentActivity } from '../types/dashboard';

export const getDashboardStats = async (): Promise<StatCard[]> => {
    const response = await apiClient.get<StatCard[]>('/dashboard/stats');
    return response.data;
};

export const getRecentActivity = async (): Promise<RecentActivity[]> => {
    const response = await apiClient.get<RecentActivity[]>('/dashboard/recent-activity');
    return response.data;
};