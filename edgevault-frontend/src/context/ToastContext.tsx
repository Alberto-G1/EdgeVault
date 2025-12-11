import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import ToastContainer from '../components/common/ToastContainer';
import type { Toast } from '../components/common/ToastContainer';

interface ToastContextType {
    showToast: (title: string, message: string, type?: 'error' | 'success' | 'info', duration?: number) => void;
    showError: (title: string, message: string, duration?: number) => void;
    showSuccess: (title: string, message: string, duration?: number) => void;
    showInfo: (title: string, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((
        title: string,
        message: string,
        type: 'error' | 'success' | 'info' = 'info',
        duration?: number
    ) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: Toast = { id, title, message, type, duration };
        
        console.log('[ToastContext] Adding toast:', newToast);
        setToasts((prev) => [newToast, ...prev]);
    }, []);

    const showError = useCallback((title: string, message: string, duration?: number) => {
        showToast(title, message, 'error', duration);
    }, [showToast]);

    const showSuccess = useCallback((title: string, message: string, duration?: number) => {
        showToast(title, message, 'success', duration);
    }, [showToast]);

    const showInfo = useCallback((title: string, message: string, duration?: number) => {
        showToast(title, message, 'info', duration);
    }, [showToast]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showError, showSuccess, showInfo }}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
