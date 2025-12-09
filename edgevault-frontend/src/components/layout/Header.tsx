import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggleButton from '../common/ThemeToggleButton';
import SearchBar from '../common/SearchBar';
import NotificationDropdown from '../common/NotificationDropdown';
import ExpandableButton from '../common/ExpandableButton';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    const logoutIcon = (
        <svg viewBox="0 0 512 512">
            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
        </svg>
    );

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
                
                <ExpandableButton 
                    icon={logoutIcon}
                    text="Logout"
                    onClick={logout}
                    bgColor="rgb(255, 65, 65)"
                    hoverWidth="125px"
                />
            </div>
        </header>
    );
};

export default Header;