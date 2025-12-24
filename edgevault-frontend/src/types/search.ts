export interface DocumentVersionInfo {
    id: number;
    versionNumber: number;
    uploaderUsername: string;
    uploadTimestamp: string;
    sizeInBytes: number;
    description?: string;
}

export interface SearchResult {
    id: number; // Document ID
    title: string;
    description?: string;
    fileName: string; // originalFileName from backend
    latestVersion: DocumentVersionInfo | null;
    versionHistory?: DocumentVersionInfo[] | null;
}

// Legacy interface for backward compatibility (if needed)
export interface LegacySearchResult {
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