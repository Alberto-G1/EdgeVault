import React, { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;