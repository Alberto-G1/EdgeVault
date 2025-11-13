import apiClient from './axiosConfig';
import type { User } from '../types/user';

// Assuming your DTOs on the backend look like this.
// CreateUserRequestDto
interface CreateUserPayload {
    username: string;
    email: string;
    password: string;
    roles: string[];
    departmentId: number; 

}

interface UpdateUserPayload {
    email: string;
    enabled: boolean;
    roles: string[];
    departmentId: number; 
    description: string;
}


export const getAllUsers = async (): Promise<User[]> => {
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