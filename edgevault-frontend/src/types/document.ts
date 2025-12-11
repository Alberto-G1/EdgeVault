export interface DocumentVersion {
    id: number;
    versionNumber: number;
    uploaderUsername: string;
    uploadTimestamp: string;
    sizeInBytes: number;
    description?: string;
}

export interface Document {
    id: number;
    title: string;
    description: string;
    fileName: string;
    latestVersion: DocumentVersion;
    versionHistory: DocumentVersion[];
}


export interface DocumentApproval {
    documentId: number;
    title: string;
    requesterUsername: string;
    departmentName: string;
    requestedAt: string;
}