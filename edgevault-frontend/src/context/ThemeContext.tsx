import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { lightTheme, darkTheme, type Theme as ThemeConfig } from '../styles/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    theme: ThemeConfig;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        // Get theme from localStorage or default to system preference
        const savedTheme = localStorage.getItem('theme') as ThemeMode;
        if (savedTheme) return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const theme = mode === 'dark' ? darkTheme : lightTheme;

    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove both classes first
        root.classList.remove('light-mode', 'dark-mode');
        
        // Add appropriate class
        if (mode === 'dark') {
            root.classList.add('dark-mode', 'dark');
        } else {
            root.classList.add('light-mode');
            root.classList.remove('dark');
        }
        
        // Set CSS variables for the theme
        root.style.setProperty('--light-blue', theme.colors.lightBlue);
        root.style.setProperty('--near-black', theme.colors.nearBlack);
        root.style.setProperty('--purple', theme.colors.purple);
        root.style.setProperty('--orange', theme.colors.orange);
        root.style.setProperty('--dark-teal', theme.colors.darkTeal);
        root.style.setProperty('--success', theme.colors.success);
        root.style.setProperty('--warning', theme.colors.warning);
        root.style.setProperty('--danger', theme.colors.danger);
        root.style.setProperty('--info', theme.colors.info);
        root.style.setProperty('--bg-primary', theme.backgrounds.primary);
        root.style.setProperty('--bg-secondary', theme.backgrounds.secondary);
        root.style.setProperty('--sidebar-bg', theme.backgrounds.sidebar);
        root.style.setProperty('--text-primary', theme.text.primary);
        root.style.setProperty('--text-secondary', theme.text.secondary);
        root.style.setProperty('--border-color', theme.border);
        root.style.setProperty('--shadow', theme.shadow);
        
        localStorage.setItem('theme', mode);
    }, [mode, theme]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ mode, theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};