import apiClient from './axiosConfig';
import type { SearchResult } from '../types/search';

// This is a placeholder for now. We will build the backend endpoint next.
export const performSearch = async (query: string): Promise<SearchResult[]> => {
    // The backend endpoint doesn't exist yet, but we define the call.
    // We'll pass the query as a URL parameter.
    const response = await apiClient.get<SearchResult[]>(`/search?q=${query}`);
    return response.data;
};