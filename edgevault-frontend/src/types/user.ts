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
    departmentName: string; // <-- ADD
    departmentId?: number; // Optional, for forms
}