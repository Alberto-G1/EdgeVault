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
    // Update this to use the new Role type
    roles: Pick<Role, 'name'>[]; // We only get the name in the user response
}