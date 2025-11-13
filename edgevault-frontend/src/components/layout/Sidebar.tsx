import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users } from 'lucide-react'; 

const Sidebar: React.FC = () => {
    const linkClasses = "flex items-center p-3 my-1 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200";
    const activeLinkClasses = "bg-cyan-600 text-white";

    return (
        <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col flex-shrink-0">
            <div className="flex items-center justify-center p-5 border-b border-gray-700">
                 <img src="/logo.png" alt="EdgeVault Logo" className="w-40" />
            </div>
            <nav className="flex-grow p-4">
                <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    Dashboard
                </NavLink>
                {/* --- ADDED LINK --- */}
                <NavLink
                    to="/admin/users"
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                    <Users className="w-5 h-5 mr-3" />
                    User Management
                </NavLink>
                 {/* ------------------ */}
            </nav>
            <div className="p-4 border-t border-gray-700 text-center text-xs text-gray-500">
                EdgeVault v1.0.0
            </div>
        </aside>
    );
};

export default Sidebar;