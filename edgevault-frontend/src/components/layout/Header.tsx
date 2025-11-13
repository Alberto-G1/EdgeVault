import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggleButton from '../common/ThemeToggleButton';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
            <div>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                    Welcome, {user?.sub || 'Admin'}!
                </h2>
            </div>
            <div className="flex items-center space-x-4">
                <ThemeToggleButton />
                <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;