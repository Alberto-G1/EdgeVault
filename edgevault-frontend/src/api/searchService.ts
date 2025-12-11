import apiClient from './axiosConfig';
import type { SearchResult } from '../types/search';

export const performSearch = async (query: string): Promise<SearchResult[]> => {
    try {
        // Pass the query as a URL-encoded parameter
        const response = await apiClient.get<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`);
        return response.data || [];
    } catch (error: any) {
        console.error('Search API error:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
        }
        throw error;
    }
};