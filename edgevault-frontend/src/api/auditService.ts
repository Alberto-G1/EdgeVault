import apiClient from './axiosConfig';
import type { AuditLog } from '../types/audit';

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>('/audit/logs');
    return response.data;
};