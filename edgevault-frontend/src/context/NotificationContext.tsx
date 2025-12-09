import React, { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import { useAuth } from '../hooks/useAuth'
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getNotificationsForUser, getUnreadNotificationCount, markNotificationAsRead } from '../api/notificationService';
import { toast } from 'react-hot-toast';

export interface Notification {
    id: number;
    message: string;
    link?: string;
    timestamp: string;
    isRead: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated, token } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const fetchInitialData = async () => {
            try {
                const [initialNotifications, initialCount] = await Promise.all([
                    getNotificationsForUser(),
                    getUnreadNotificationCount()
                ]);
                setNotifications(initialNotifications);
                setUnreadCount(initialCount.count);
            } catch (error) {
                console.error("Failed to fetch initial notifications", error);
            }
        };
        fetchInitialData();

        const client = new Client({
            webSocketFactory: () => new SockJS(`http://localhost:8082/ws?token=${token}`),
            onConnect: () => {
                console.log("Notification WebSocket connected.");
                client.subscribe('/user/topic/notifications', (message) => {
                    const newNotification = JSON.parse(message.body) as Notification;
                    toast.info(`New notification: ${newNotification.message}`, {
                        icon: '🔔',
                    });
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                });
            },
            onStompError: (frame) => {
                console.error("Notification STOMP error:", frame);
            },
            reconnectDelay: 5000,
        });

        client.activate();

        return () => { 
            if (client) {
                client.deactivate(); 
                console.log("Notification WebSocket disconnected.");
            }
        };

    }, [isAuthenticated, token]);
    
    const markAsRead = async (id: number) => {
        const notification = notifications.find(n => n.id === id);
        if (notification && !notification.isRead) {
            try {
                await markNotificationAsRead(id);
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                toast.error("Failed to mark notification as read.");
            }
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
    return context;
};