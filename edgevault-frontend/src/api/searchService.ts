import apiClient from './axiosConfig';
import type { SearchResult } from '../types/search';

export const performSearch = async (query: string): Promise<SearchResult[]> => {
    // Pass the query as a URL-encoded parameter
    const response = await apiClient.get<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
};