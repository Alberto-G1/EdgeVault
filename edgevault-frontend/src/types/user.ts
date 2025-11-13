export interface Role {
    id: number;
    name: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    enabled: boolean;
    roles: Role[];
}