export interface SearchResult {
    id: string; // DocumentVersion ID
    documentId: number;
    title: string;
    originalFileName: string;
    description?: string;
    content: string; // We can use this for highlighting later
    uploaderUsername: string;
    uploadTimestamp: string;
    versionNumber: number;
}