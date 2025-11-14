import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Building } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';

const Sidebar: React.FC = () => {
    const { hasAnyPermission } = usePermissions();
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

                {hasAnyPermission(['USER_READ', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE']) && (
                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                        <Users className="w-5 h-5 mr-3" />
                        User Management
                    </NavLink>
                )}

                {hasAnyPermission(['ROLE_READ', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE']) && (
                    <NavLink
                        to="/admin/roles"
                        className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                        <Shield className="w-5 h-5 mr-3" />
                        Role Management
                    </NavLink>
                )}

                {hasAnyPermission(['DEPARTMENT_READ', 'DEPARTMENT_CREATE', 'DEPARTMENT_UPDATE', 'DEPARTMENT_DELETE']) && (
                     <NavLink
                        to="/admin/departments"
                        className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                        <Building className="w-5 h-5 mr-3" />
                        Departments
                    </NavLink>
                )}
            </nav>
            <div className="p-4 border-t border-gray-700 text-center text-xs text-gray-500">
                EdgeVault v1.0.0
            </div>
        </aside>
    );
};

export default Sidebar;