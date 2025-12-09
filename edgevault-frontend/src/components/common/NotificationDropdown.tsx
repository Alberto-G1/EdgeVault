import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const navigate = useNavigate();
    
    const handleNotificationClick = (notificationId: number, link?: string) => {
        markAsRead(notificationId);
        setIsOpen(false);
        if (link) {
            navigate(link);
        }
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700">
                    <div className="p-3 font-semibold border-b dark:border-gray-700">Notifications</div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? notifications.slice(0, 5).map(notif => (
                            <div 
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif.id, notif.link)}
                                className={`p-3 flex items-start hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${!notif.isRead ? 'font-bold' : 'font-normal'}`}
                            >
                                <span className={`flex-shrink-0 w-2 h-2 mt-1.5 rounded-full ${!notif.isRead ? 'bg-cyan-500' : 'bg-transparent'}`}></span>
                                <div className="ml-3">
                                    <p className="text-sm">{notif.message}</p>
                                    <p className={`text-xs mt-1 text-gray-500 ${!notif.isRead ? 'font-semibold' : 'font-normal'}`}>
                                        {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="p-4 text-sm text-gray-500">No notifications yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;