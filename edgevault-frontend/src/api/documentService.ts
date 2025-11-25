import apiClient from './axiosConfig';
import type { Document } from '../types/document';

/**
 * Uploads a new document.
 * This function uses FormData to send the file as a multipart request.
 * @param file The file object to upload.
 * @returns A promise that resolves to the newly created document's metadata.
 */
export const uploadDocument = async (title: string, description: string, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);

    const response = await apiClient.post<Document>('/documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Fetches all documents that belong to the current user's department.
 * @returns A promise that resolves to an array of document metadata objects.
 */
export const getMyDepartmentDocuments = async (): Promise<Document[]> => {
    const response = await apiClient.get<Document[]>('/documents');
    return response.data;
};

// In the future, we will add more functions here, such as:
// - downloadDocumentVersion(versionId: number)
// - uploadNewVersion(documentId: number, file: File)
// - getDocumentDetails(documentId: number)    

export const uploadNewVersion = async (documentId: number, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Document>(`/documents/${documentId}/versions`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};


export const getDocumentDetails = async (id: number): Promise<Document> => {
    const response = await apiClient.get<Document>(`/documents/${id}`);
    return response.data;
};

export const requestDocumentDeletion = async (id: number): Promise<void> => {
    await apiClient.delete(`/documents/${id}/request-deletion`);
};

// Download is handled differently - we need the raw response
export const downloadDocumentVersion = async (versionId: number): Promise<{data: Blob, filename: string}> => {
    const response = await apiClient.get(`/documents/versions/${versionId}/download`, {
        responseType: 'blob', // Important: tells axios to handle the response as a file
    });

    // Extract filename from content-disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'downloaded-file';
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length > 1) {
            filename = filenameMatch[1];
        }
    }
    
    return { data: response.data, filename };
};