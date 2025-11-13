import apiClient from './axiosConfig';
import type { Department } from '../types/user';

export const getAllDepartments = async (): Promise<Department[]> => {
    const response = await apiClient.get<Department[]>('/departments');
    return response.data;
};

export const createDepartment = async (name: string, description: string): Promise<Department> => {
    const response = await apiClient.post<Department>('/departments', { name, description });
    return response.data;
};

export const updateDepartment = async (id: number, name: string, description: string): Promise<Department> => {
    const response = await apiClient.put<Department>(`/departments/${id}`, { name, description });
    return response.data;
};

export const deleteDepartment = async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}`);
};

