import apiClient from './axiosConfig';
import type { Role } from '../types/user';

interface RolePayload {
    name: string;
    permissions: string[];
}

export const getRoleById = async (roleId: number): Promise<Role> => {
    const response = await apiClient.get<Role>(`/roles/${roleId}`);
    return response.data;
};

export const getAllRoles = async (): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>('/roles');
    return response.data;
};

export const createRole = async (roleData: RolePayload): Promise<Role> => {
    const response = await apiClient.post<Role>('/roles', roleData);
    return response.data;
};

export const updateRole = async (roleId: number, roleData: RolePayload): Promise<Role> => {
    const response = await apiClient.put<Role>(`/roles/${roleId}`, roleData);
    return response.data;
};

export const deleteRole = async (roleId: number): Promise<void> => {
    await apiClient.delete(`/roles/${roleId}`);
};