export interface DocumentVersion {
    id: number;
    versionNumber: number;
    uploaderUsername: string;
    uploadTimestamp: string;
    sizeInBytes: number;
}

export interface Document {
    id: number;
    fileName: string;
    latestVersion: DocumentVersion;
    versionHistory: DocumentVersion[];
}```

**File:** `src/api/documentService.ts` (New File)
```ts
import apiClient from './axiosConfig';
import type { Document } from '../types/document';

export const uploadDocument = async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Document>('/documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getMyDepartmentDocuments = async (): Promise<Document[]> => {
    const response = await apiClient.get<Document[]>('/documents');
    return response.data;
};