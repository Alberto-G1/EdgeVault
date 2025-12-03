import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../../api/userService';
import type { User } from '../../types/user'; // Assuming User type is in user.ts
import { toast } from 'react-hot-toast';
import { Users, Globe } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ChatSidebar: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const allUsers = await getAllUsers();
                // Filter out the current user from the list
                setUsers(allUsers.filter(u => u.username !== currentUser?.sub));
            } catch (error) {
                toast.error("Failed to fetch user list for chat.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [currentUser]);

    const linkClasses = "flex items-center p-3 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200";
    const activeLinkClasses = "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 font-semibold";

    return (
        <div className="w-full h-full bg-white dark:bg-gray-800 flex flex-col">
            <h2 className="text-lg font-semibold p-4 border-b dark:border-gray-700">Conversations</h2>
            <div className="flex-grow overflow-y-auto p-2">
                {/* Global Chat Link */}
                <NavLink 
                    to="/admin/chat/1" // Assuming Global Chat always has ID 1
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                    <Globe size={20} className="mr-3"/> Global Chat
                </NavLink>

                <h3 className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Direct Messages</h3>
                {loading ? (
                    <p className="p-3 text-sm text-gray-500">Loading users...</p>
                ) : (
                    users.map(user => (
                         <NavLink 
                            key={user.id}
                            to={`/admin/chat/dm/${user.username}`}
                            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                         >
                             <img 
                                src={`https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`} 
                                className="w-8 h-8 rounded-full mr-3" 
                                alt={user.username}
                            />
                            {user.username}
                         </NavLink>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;