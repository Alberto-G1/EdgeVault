import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Upload, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import styled from 'styled-components';

const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const handleNotificationClick = (notificationId: number, link?: string) => {
        markAsRead(notificationId);
        setIsOpen(false);
        if (link) {
            navigate(link);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getNotificationIcon = (type?: string) => {
        switch(type) {
            case 'upload':
                return <Upload size={16} />;
            case 'approval':
                return <FileText size={16} />;
            case 'warning':
                return <AlertTriangle size={16} />;
            case 'success':
                return <CheckCircle size={16} />;
            default:
                return <Bell size={16} />;
        }
    };

    const getIconClass = (type?: string) => {
        switch(type) {
            case 'upload':
                return 'upload';
            case 'approval':
                return 'approval';
            case 'warning':
                return 'warning';
            case 'success':
                return 'success';
            default:
                return 'upload';
        }
    };

    return (
        <NotificationContainer ref={dropdownRef}>
            <NotificationBell onClick={() => setIsOpen(!isOpen)}>
                <Bell size={20} />
                {unreadCount > 0 && (
                    <NotificationCount>{unreadCount}</NotificationCount>
                )}
            </NotificationBell>

            <NotificationMenu className={isOpen ? 'active' : ''}>
                <NotificationHeader>
                    <NotificationTitle>Notifications</NotificationTitle>
                    <MarkReadButton onClick={() => { markAllAsRead(); }}>
                        Mark all as read
                    </MarkReadButton>
                </NotificationHeader>
                
                <NotificationList>
                    {notifications.length > 0 ? notifications.slice(0, 5).map(notif => (
                        <NotificationItem 
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif.id, notif.link)}
                            className={!notif.isRead ? 'unread' : ''}
                        >
                            <NotificationIcon className={getIconClass(notif.type)}>
                                {getNotificationIcon(notif.type)}
                            </NotificationIcon>
                            <NotificationContent>
                                <NotificationText>{notif.message}</NotificationText>
                                <NotificationTime>
                                    {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                </NotificationTime>
                            </NotificationContent>
                        </NotificationItem>
                    )) : (
                        <EmptyNotification>No notifications yet.</EmptyNotification>
                    )}
                </NotificationList>

                {notifications.length > 5 && (
                    <NotificationFooter>
                        <ViewAllLink onClick={() => { setIsOpen(false); navigate('/admin/notifications'); }}>
                            View all notifications
                        </ViewAllLink>
                    </NotificationFooter>
                )}
            </NotificationMenu>
        </NotificationContainer>
    );
};

const NotificationContainer = styled.div`
    position: relative;
`;

const NotificationBell = styled.button`
    position: relative;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-primary);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 18px;
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;

    &:hover {
        background-color: var(--light-blue);
        color: white;
        border-color: var(--light-blue);
    }
`;

const NotificationCount = styled.div`
    position: absolute;
    top: -2px;
    right: -2px;
    background-color: var(--danger);
    color: white;
    font-size: 11px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    border: 2px solid var(--sidebar-bg);
`;

const NotificationMenu = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    width: 350px;
    background-color: var(--bg-secondary);
    border-radius: 10px;
    box-shadow: 0 5px 20px var(--shadow);
    border: 1px solid var(--border-color);
    padding: 15px 0;
    margin-top: 10px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    z-index: 1001;
    font-family: 'Poppins', sans-serif;

    &.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }

    @media (max-width: 576px) {
        width: 300px;
        right: -50px;
    }
`;

const NotificationHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px 10px 15px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 10px;
`;

const NotificationTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
`;

const MarkReadButton = styled.button`
    font-size: 13px;
    color: var(--light-blue);
    cursor: pointer;
    background: none;
    border: none;
    font-family: 'Poppins', sans-serif;
    transition: all 0.2s ease;

    &:hover {
        text-decoration: underline;
    }
`;

const NotificationList = styled.div`
    max-height: 350px;
    overflow-y: auto;
`;

const NotificationItem = styled.div`
    display: flex;
    align-items: flex-start;
    padding: 12px 15px;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: var(--bg-primary);
    }

    &.unread {
        background-color: rgba(46, 151, 197, 0.05);
    }
`;

const NotificationIcon = styled.div`
    width: 38px;
    height: 38px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    margin-right: 12px;
    flex-shrink: 0;

    &.upload {
        background-color: var(--light-blue);
    }

    &.approval {
        background-color: var(--orange);
    }

    &.warning {
        background-color: var(--warning);
    }

    &.success {
        background-color: var(--success);
    }
`;

const NotificationContent = styled.div`
    flex: 1;
`;

const NotificationText = styled.div`
    font-size: 14px;
    margin-bottom: 3px;
    line-height: 1.4;
    color: var(--text-primary);
`;

const NotificationTime = styled.div`
    font-size: 12px;
    color: var(--text-secondary);
`;

const EmptyNotification = styled.div`
    padding: 20px;
    text-align: center;
    font-size: 14px;
    color: var(--text-secondary);
`;

const NotificationFooter = styled.div`
    text-align: center;
    padding-top: 10px;
    border-top: 1px solid var(--border-color);
    margin-top: 10px;
`;

const ViewAllLink = styled.button`
    color: var(--light-blue);
    text-decoration: none;
    font-size: 14px;
    padding: 8px;
    display: block;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    transition: all 0.2s ease;

    &:hover {
        text-decoration: underline;
    }
`;

export default NotificationDropdown;