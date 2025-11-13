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
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [user, setUser] = useState<AuthToken | null>(null);

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode<AuthToken>(token);
                // Check if token is expired
                if (decodedToken.exp * 1000 > Date.now()) {
                    setUser(decodedToken);
                } else {
                    // Token is expired
                    logout();
                }
            } catch (error) {
                console.error("Invalid token:", error);
                logout();
            }
        }
    }, [token]);

    const login = (newToken: string) => {
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};