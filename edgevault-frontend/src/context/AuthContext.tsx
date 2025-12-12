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
    const [user, setUser] = useState<AuthToken | null>(() => {
        // Initialize user from token immediately to prevent false negative on isAuthenticated
        const savedToken = localStorage.getItem('authToken');
        if (savedToken) {
            try {
                const decoded = jwtDecode<AuthToken>(savedToken);
                if (decoded.exp * 1000 > Date.now()) {
                    return decoded;
                }
            } catch (error) {
                console.error("Error decoding token on init:", error);
            }
        }
        return null;
    });
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
                const expirationTime = decodedToken.exp * 1000;
                const currentTime = Date.now();
                const timeUntilExpiry = expirationTime - currentTime;
                
                // Debug logging
                console.log('Token validation:', {
                    expiresAt: new Date(expirationTime).toLocaleString(),
                    timeUntilExpiry: `${Math.floor(timeUntilExpiry / 1000 / 60)} minutes`,
                    isValid: timeUntilExpiry > 0
                });
                
                if (timeUntilExpiry > 0) {
                    setUser(decodedToken);
                } else {
                    console.warn('Token expired, logging out');
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

    const login = useCallback((newToken: string, newPermissions: string[], newPasswordChangeRequired: boolean) => {
        console.log('Login called with:', { 
            hasToken: !!newToken, 
            permissionsCount: newPermissions.length,
            passwordChangeRequired: newPasswordChangeRequired 
        });
        
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('userPermissions', JSON.stringify(newPermissions));
        localStorage.setItem('passwordChangeRequired', JSON.stringify(newPasswordChangeRequired));
        setToken(newToken);
        setPermissions(new Set(newPermissions));
        setPasswordChangeRequired(newPasswordChangeRequired);
    }, []);
    
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
    }), [token, user, permissions, passwordChangeRequired, login, logout, fulfillPasswordChange]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};