import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Building, FileText, ClipboardCheck, MessageSquare, History } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { getTotalUnreadCount } from '../../api/chatService';
import styled from 'styled-components';

const Sidebar: React.FC = () => {
    const { hasAnyPermission } = usePermissions();
    const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const count = await getTotalUnreadCount();
                setTotalUnreadCount(count);
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
            }
        };

        fetchUnreadCount();
        
        // Refresh every 10 seconds
        const interval = setInterval(fetchUnreadCount, 10000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <SidebarContainer>
            <LogoSection>
                <img src="/logo.png" alt="EdgeVault Logo" className="logo-image" />
            </LogoSection>
            
            <SidebarNav>
                <NavItem to="/admin/dashboard">
                    {({ isActive }) => (
                        <NavContent className={isActive ? 'active' : ''}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </NavContent>
                    )}
                </NavItem>

                {hasAnyPermission(['USER_READ', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE']) && (
                    <NavItem to="/admin/users">
                        {({ isActive }) => (
                            <NavContent className={isActive ? 'active' : ''}>
                                <Users size={20} />
                                <span>User Management</span>
                            </NavContent>
                        )}
                    </NavItem>
                )}

                {hasAnyPermission(['ROLE_READ', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE']) && (
                    <NavItem to="/admin/roles">
                        {({ isActive }) => (
                            <NavContent className={isActive ? 'active' : ''}>
                                <Shield size={20} />
                                <span>Role Management</span>
                            </NavContent>
                        )}
                    </NavItem>
                )}

                {hasAnyPermission(['DEPARTMENT_READ', 'DEPARTMENT_CREATE', 'DEPARTMENT_UPDATE', 'DEPARTMENT_DELETE']) && (
                    <NavItem to="/admin/departments">
                        {({ isActive }) => (
                            <NavContent className={isActive ? 'active' : ''}>
                                <Building size={20} />
                                <span>Departments</span>
                            </NavContent>
                        )}
                    </NavItem>
                )}
                
                {hasAnyPermission(['DOCUMENT_READ', 'DOCUMENT_CREATE', 'DOCUMENT_UPDATE', 'DOCUMENT_DELETE']) && (
                    <NavItem to="/admin/documents">
                        {({ isActive }) => (
                            <NavContent className={isActive ? 'active' : ''}>
                                <FileText size={20} />
                                <span>Documents</span>
                            </NavContent>
                        )}
                    </NavItem>
                )}
                
                {hasAnyPermission(['DOCUMENT_APPROVAL']) && (
                    <NavItem to="/admin/approvals">
                        {({ isActive }) => (
                            <NavContent className={isActive ? 'active' : ''}>
                                <ClipboardCheck size={20} />
                                <span>Approval Queue</span>
                            </NavContent>
                        )}
                    </NavItem>
                )}
                
                <NavItem to="/admin/chat">
                    {({ isActive }) => (
                        <NavContent className={isActive ? 'active' : ''}>
                            <MessageSquare size={20} />
                            <span>Chat</span>
                            {totalUnreadCount > 0 && (
                                <TotalUnreadBadge>{totalUnreadCount}</TotalUnreadBadge>
                            )}
                        </NavContent>
                    )}
                </NavItem>
                
                {hasAnyPermission(['AUDIT_READ']) && (
                    <NavItem to="/admin/audit-logs">
                        {({ isActive }) => (
                            <NavContent className={isActive ? 'active' : ''}>
                                <History size={20} />
                                <span>Audit Logs</span>
                            </NavContent>
                        )}
                    </NavItem>
                )}
            </SidebarNav>
            
            <SidebarFooter>
                <div>EdgeVault</div>
                <Version>v1.0.0</Version>
            </SidebarFooter>
        </SidebarContainer>
    );
};

const SidebarContainer = styled.aside`
    background-color: var(--sidebar-bg);
    width: 280px;
    height: 100vh;
    overflow-y: auto;
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    font-family: 'Poppins', sans-serif;

    @media (max-width: 1100px) {
        width: 70px;
    }

    @media (max-width: 576px) {
        display: none;
    }
`;

const LogoSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border-bottom: 1px solid var(--border-color);

    .logo-image {
        width: 160px;
        height: auto;
        object-fit: contain;

        @media (max-width: 1100px) {
            width: 40px;
        }
    }
`;

const SidebarNav = styled.nav`
    flex-grow: 1;
    padding: 20px;
    list-style: none;

    @media (max-width: 1100px) {
        padding: 20px 10px;
    }
`;

const NavItem = styled(NavLink)`
    display: block;
    margin-bottom: 5px;
    text-decoration: none;
`;

const NavContent = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 15px;
    color: var(--text-secondary);
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
    position: relative;

    svg {
        flex-shrink: 0;
    }

    &:hover {
        background-color: var(--bg-primary);
        color: var(--text-primary);
    }

    &.active {
        background-color: var(--bg-primary);
        color: var(--light-blue);
        border-left: 3px solid var(--light-blue);
    }

    @media (max-width: 1100px) {
        justify-content: center;
        padding: 15px;

        span {
            display: none;
        }
    }
`;

const SidebarFooter = styled.div`
    padding: 20px;
    border-top: 1px solid var(--border-color);
    text-align: center;
    color: var(--text-secondary);
    font-size: 13px;

    @media (max-width: 1100px) {
        div:first-child {
            display: none;
        }
    }
`;

const Version = styled.div`
    margin-top: 5px;
    color: var(--light-blue);
    font-weight: 600;
`;

const TotalUnreadBadge = styled.div`
    margin-left: auto;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.25rem 0.65rem;
    border-radius: 12px;
    min-width: 24px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
    animation: pulseBadge 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.3);

    @keyframes pulseBadge {
        0%, 100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.85;
            transform: scale(1.05);
        }
    }
    
    @media (max-width: 1100px) {
        position: absolute;
        top: 8px;
        right: 8px;
        margin-left: 0;
        font-size: 0.65rem;
        padding: 0.2rem 0.5rem;
        min-width: 20px;
    }
`;

export default Sidebar;