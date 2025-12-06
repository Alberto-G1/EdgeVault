import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../../api/userService';
import type { User } from '../../types/user';
import { toast } from 'react-hot-toast';
import { Users, Globe } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom'; // <-- IMPORT useNavigate
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../api/axiosConfig'; // <-- IMPORT apiClient

const ChatSidebar: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();
    const navigate = useNavigate(); // <-- USE HOOK

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const allUsers = await getAllUsers();
                setUsers(allUsers.filter(u => u.username !== currentUser?.sub));
            } catch (error) {
                toast.error("Failed to fetch user list for chat.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [currentUser]);

    // --- THIS IS THE FIX for the logout bug ---
    const handleDmClick = async (e: React.MouseEvent, username: string) => {
        e.preventDefault(); // Prevent NavLink's default navigation
        try {
            const response = await apiClient.post(`/conversations/dm?withUser=${username}`);
            const conversation = response.data;
            // Now navigate directly to the resolved conversation ID
            navigate(`/admin/chat/${conversation.id}`);
        } catch (error) {
            toast.error(`Could not start conversation with ${username}.`);
        }
    };
    // ------------------------------------------

    const linkClasses = "flex items-center p-3 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200";
    const activeLinkClasses = "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 font-semibold";

    return (
        <div className="w-full h-full bg-white dark:bg-gray-800 flex flex-col">
            <h2 className="text-lg font-semibold p-4 border-b dark:border-gray-700">Conversations</h2>
            <div className="flex-grow overflow-y-auto p-2">
                <NavLink 
                    to="/admin/chat/1" // Global Chat
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
                            to={`/admin/chat/${user.id}`} // Dummy path, onClick will override
                            onClick={(e) => handleDmClick(e, user.username)}
                            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                         >
                             <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`} className="w-8 h-8 rounded-full mr-3" alt={user.username} />
                            {user.username}
                         </NavLink>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;