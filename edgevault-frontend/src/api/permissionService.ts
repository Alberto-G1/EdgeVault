import apiClient from './axiosConfig';

export const getAllPermissions = async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/permissions');
    return response.data;
};