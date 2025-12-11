import React, { createContext, useState, useEffect, type ReactNode, useMemo, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthToken {
    sub: string;
    iat: number;
    exp: number;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthToken | null;
    token: string | null;
    permissions: Set<string>;
    passwordChangeRequired: boolean;
    login: (token: string, permissions: string[], passwordChangeRequired: boolean) => void;
    logout: () => void;
    fulfillPasswordChange: () => void; // New function to update the flag
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [user, setUser] = useState<AuthToken | null>(null);
    const [permissions, setPermissions] = useState<Set<string>>(() => {
        const savedPerms = localStorage.getItem('userPermissions');
        return savedPerms ? new Set(JSON.parse(savedPerms)) : new Set();
    });
    const [passwordChangeRequired, setPasswordChangeRequired] = useState<boolean>(() => {
        const savedFlag = localStorage.getItem('passwordChangeRequired');
        return savedFlag ? JSON.parse(savedFlag) : false;
    });

    // Define logout before useEffect so it can be used there
    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userPermissions');
        localStorage.removeItem('passwordChangeRequired');
        setToken(null);
        setUser(null);
        setPermissions(new Set());
        setPasswordChangeRequired(false);
    }, []);

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode<AuthToken>(token);
                if (decodedToken.exp * 1000 > Date.now()) {
                    setUser(decodedToken);
                } else {
                    logout();
                }
            } catch (error) {
                console.error("Invalid token found, logging out:", error);
                logout();
            }
        } else {
            // Ensure user is null if token is null
            setUser(null);
        }
    }, [token, logout]);

    const login = (newToken: string, newPermissions: string[], newPasswordChangeRequired: boolean) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('userPermissions', JSON.stringify(newPermissions));
        localStorage.setItem('passwordChangeRequired', JSON.stringify(newPermissions));
        setToken(newToken);
        setPermissions(new Set(newPermissions));
        setPasswordChangeRequired(newPasswordChangeRequired);
    };
    
    // New function to update state after a successful password change
    const fulfillPasswordChange = useCallback(() => {
        localStorage.setItem('passwordChangeRequired', 'false');
        setPasswordChangeRequired(false);
    }, []);

    const contextValue = useMemo(() => ({
        isAuthenticated: !!token && !!user,
        user,
        token,
        permissions,
        passwordChangeRequired,
        login,
        logout,
        fulfillPasswordChange,
    }), [token, user, permissions, passwordChangeRequired, fulfillPasswordChange]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};