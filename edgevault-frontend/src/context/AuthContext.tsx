import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthToken {
    sub: string; // Subject, which is the username
    iat: number; // Issued at
    exp: number; // Expiration time
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthToken | null;
    token: string | null;
    permissions: Set<string>;
    login: (token: string, permissions: string[]) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [user, setUser] = useState<AuthToken | null>(null);
    const [permissions, setPermissions] = useState<Set<string>>(() => {
        const savedPerms = localStorage.getItem('userPermissions');
        return savedPerms ? new Set(JSON.parse(savedPerms)) : new Set();
    });

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode<AuthToken>(token);
                if (decodedToken.exp * 1000 > Date.now()) {
                    setUser(decodedToken);
                } else {
                    logout(); // Token is expired, so log out
                }
            } catch (error) {
                console.error("Invalid token found, logging out:", error);
                logout();
            }
        }
    }, [token]);

    const login = (newToken: string, newPermissions: string[]) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('userPermissions', JSON.stringify(newPermissions));
        setToken(newToken);
        setPermissions(new Set(newPermissions));
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userPermissions');
        setToken(null);
        setUser(null);
        setPermissions(new Set());
    };

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, permissions, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};