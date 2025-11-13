import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

const ThemeToggleButton: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-800"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="w-6 h-6" />
            ) : (
                <Sun className="w-6 h-6 text-yellow-400" />
            )}
        </button>
    );
};

export default ThemeToggleButton;