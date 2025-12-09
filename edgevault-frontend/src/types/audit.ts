export interface AuditLog {
    id: number;
    username: string;
    action: string;
    details: string;
    timestamp: string;
    previousHash: string;
    currentHash: string;
}