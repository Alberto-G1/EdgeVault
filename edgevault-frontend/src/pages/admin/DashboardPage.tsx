import React, { useEffect, useState } from 'react';
import { getDashboardStats, getRecentActivity } from '../../api/dashboardService';
import type { StatCard, RecentActivity } from '../../types/dashboard';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';
import { Users, FileText, LogIn, ClipboardCheck, History, FolderOpen, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import styled from 'styled-components';
import FullPageLoader from '../../components/common/FullPageLoader';
import WelcomeCard from '../../components/common/WelcomeCard';

const iconMap = {
    "Total Users": <Users className="h-8 w-8" style={{ color: 'var(--light-blue)' }} />,
    "Total Documents": <FileText className="h-8 w-8" style={{ color: 'var(--success)' }} />,
    "Total Logins Today": <LogIn className="h-8 w-8" style={{ color: 'var(--purple)' }} />,
    "Pending Approvals": <ClipboardCheck className="h-8 w-8" style={{ color: 'var(--warning)' }} />,
    "My Documents": <FolderOpen className="h-8 w-8" style={{ color: 'var(--light-blue)' }} />,
    "My Activity": <Activity className="h-8 w-8" style={{ color: 'var(--success)' }} />,
};

const DashboardPage: React.FC = () => {
    const { showError } = useToast();
    const { hasAnyPermission } = usePermissions();
    const { user } = useAuth();
    const [stats, setStats] = useState<StatCard[]>([]);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Check if user has admin permissions
    const isAdmin = hasAnyPermission(['USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'ROLE_CREATE']);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, activityData] = await Promise.all([
                    getDashboardStats(),
                    getRecentActivity()
                ]);
                
                // Filter stats based on user role
                let filteredStats = statsData;
                if (!isAdmin) {
                    // Regular users only see their own stats
                    filteredStats = statsData.filter(stat => 
                        stat.title === 'My Documents' || 
                        stat.title === 'My Activity'
                    );
                }
                
                setStats(filteredStats);
                setActivities(activityData);
            } catch (error) {
                showError('Error', 'Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAdmin]);

    if (loading) return <FullPageLoader />;

    return (
        <DashboardContainer>
            <WelcomeCard />
            
            <DashboardHeader>
                <h1 className="title">{isAdmin ? 'Admin Dashboard' : 'My Dashboard'}</h1>
            </DashboardHeader>

            {/* Stat Cards */}
            <StatsGrid>
                {stats.map((stat, index) => (
                    <StatCard key={stat.title} style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="stat-content">
                            <p className="stat-label">{stat.title}</p>
                            <p className="stat-value">{stat.value}</p>
                        </div>
                        <div className="stat-icon">
                            {iconMap[stat.title] || <History />}
                        </div>
                    </StatCard>
                ))}
            </StatsGrid>

            {/* Recent Activity - Show all for admins, only user's own for regular users */}
            {activities.length > 0 && (
                <ActivitySection>
                    <h2 className="activity-title">{isAdmin ? 'Recent Activity' : 'My Recent Activity'}</h2>
                    <ActivityList>
                        {activities.map((activity, index) => (
                            <ActivityItem key={index} style={{ animationDelay: `${0.5 + index * 0.05}s` }}>
                                <p className="activity-main">
                                    <span className="username">{activity.username}</span>{' '}
                                    {activity.action.toLowerCase().replace(/_/g, ' ')}
                                </p>
                                <p className="activity-details" title={activity.details}>
                                    {activity.details}
                                </p>
                                <p className="activity-time">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </p>
                            </ActivityItem>
                        ))}
                    </ActivityList>
                </ActivitySection>
            )}
        </DashboardContainer>
    );
};

const DashboardContainer = styled.div`
    width: 100%;
    padding: 30px;
    animation: fadeIn 0.4s ease-in;

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 768px) {
        padding: 25px 20px;
    }

    @media (max-width: 480px) {
        padding: 20px 15px;
    }
`;

const DashboardHeader = styled.div`
    margin-bottom: 40px;
    animation: slideUp 0.5s ease-out backwards;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .title {
        font-size: 36px;
        font-weight: 700;
        font-family: 'Poppins', sans-serif;
        color: var(--text-primary);
        margin: 0;

        @media (max-width: 768px) {
            font-size: 28px;
        }

        @media (max-width: 480px) {
            font-size: 24px;
        }
    }

    @media (max-width: 768px) {
        margin-bottom: 30px;
    }

    @media (max-width: 480px) {
        margin-bottom: 20px;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    margin-bottom: 40px;

    @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 15px;
        margin-bottom: 30px;
    }
`;

const StatCard = styled.div`
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 16px var(--shadow);
    transition: all 0.3s ease;
    font-family: 'Poppins', sans-serif;
    animation: slideUp 0.5s ease-out backwards;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(to right, var(--light-blue), var(--purple));
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
    }

    &:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 32px var(--shadow);
        border-color: var(--light-blue);
        
        &::before {
            transform: scaleX(1);
        }
    }

    .stat-content {
        flex: 1;
    }

    .stat-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-secondary);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;

        @media (max-width: 480px) {
            font-size: 12px;
        }
    }

    .stat-value {
        font-size: 36px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;

        @media (max-width: 768px) {
            font-size: 30px;
        }

        @media (max-width: 480px) {
            font-size: 26px;
        }
    }

    .stat-icon {
        width: 64px;
        height: 64px;
        background: var(--bg-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 16px;
        animation: pulse 2s ease-in-out infinite;

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }

        @media (max-width: 480px) {
            width: 52px;
            height: 52px;
        }
    }

    @media (max-width: 768px) {
        padding: 24px;
    }

    @media (max-width: 480px) {
        padding: 20px;
    }
`;

const ActivitySection = styled.div`
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 16px var(--shadow);
    font-family: 'Poppins', sans-serif;
    animation: slideUp 0.5s ease-out 0.4s backwards;

    .activity-title {
        font-size: 24px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 24px;

        @media (max-width: 768px) {
            font-size: 20px;
            margin-bottom: 20px;
        }

        @media (max-width: 480px) {
            font-size: 18px;
            margin-bottom: 16px;
        }
    }

    @media (max-width: 768px) {
        padding: 24px;
    }

    @media (max-width: 480px) {
        padding: 20px;
    }
`;

const ActivityList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const ActivityItem = styled.li`
    padding: 20px 0;
    border-bottom: 1px solid var(--border-color);
    transition: all 0.2s ease;
    animation: slideUp 0.4s ease-out backwards;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: var(--bg-primary);
        margin-left: -16px;
        margin-right: -16px;
        padding-left: 16px;
        padding-right: 16px;
        border-radius: 8px;
        transform: translateX(4px);
    }

    .activity-main {
        font-size: 15px;
        color: var(--text-primary);
        margin-bottom: 6px;

        @media (max-width: 480px) {
            font-size: 14px;
        }
    }

    .username {
        font-weight: 700;
        color: var(--light-blue);
    }

    .activity-details {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        @media (max-width: 480px) {
            font-size: 13px;
        }
    }

    .activity-time {
        font-size: 12px;
        color: var(--text-muted);

        @media (max-width: 480px) {
            font-size: 11px;
        }
    }

    @media (max-width: 768px) {
        padding: 16px 0;
    }

    @media (max-width: 480px) {
        padding: 14px 0;
    }
`;

export default DashboardPage;