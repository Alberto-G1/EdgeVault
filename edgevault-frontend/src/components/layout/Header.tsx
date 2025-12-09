import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggleButton from '../common/ThemeToggleButton';
import SearchBar from '../common/SearchBar';
import NotificationDropdown from '../common/NotificationDropdown';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
            {/* Left Section */}
            <div>
                <SearchBar />
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">
                    Welcome, {user?.sub || 'Admin'}!
                </span>
                
                <ThemeToggleButton />
                
                <NotificationDropdown />
                
                <Link 
                    to="/admin/profile" 
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="My Profile"
                >
                    <User size={20} />
                </Link>
                
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