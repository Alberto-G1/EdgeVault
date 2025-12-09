import apiClient from './axiosConfig';
import type { User } from '../types/user';

// Corresponds to CreateUserRequestDto
interface CreateUserPayload {
    username: string;
    email: string;
    roles: string[];
    departmentId: number;
}

// Corresponds to UpdateUserRequestDto
interface UpdateUserPayload {
    email: string;
    enabled: boolean;
    roles: string[];
    departmentId: number;
}

// For ChatSidebar - calls the lightweight endpoint
export const getAllUserSummaries = async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/summaries');
    return response.data;
};

// For UserManagementPage - calls the detailed, protected endpoint
export const getAllUserDetails = async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
};

export const createUser = async (userData: CreateUserPayload): Promise<User> => {
    const response = await apiClient.post<User>('/users', userData);
    return response.data;
};

export const updateUser = async (userId: number, userData: UpdateUserPayload): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${userId}`, userData);
    return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
};