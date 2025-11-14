export interface Department {
    id: number;
    name: string;
}

export interface Role {
    id: number;
    name: string;
    permissions: string[];
}

export interface User {
    id: number;
    username: string;
    email: string;
    enabled: boolean;
    roles: Pick<Role, 'name'>[];
    departmentName: string;
    departmentId?: number; 
}

// This will now represent the full profile DTO from the backend
export interface UserProfile {
    profilePictureUrl?: string;
    firstName?: string;
    lastName?: string;
    gender?: 'MALE' | 'FEMALE';
    dateOfBirth?: string; // Dates are often strings in JSON
    phoneNumber?: string;
    alternativePhoneNumber?: string;
    email: string;
    city?: string;
    district?: string;
    country?: string;
    departmentName?: string;
    roles: string[];
    employeeId?: string;
    jobTitle?: string;
    dateJoined?: string;
    supervisorName?: string;
    username: string;
    lastLogin?: string;
    accountStatus: 'ACTIVE' | 'SUSPENDED' | 'LOCKED';
    passwordLastUpdated?: string;
    backupRecoveryEmail?: string;
}