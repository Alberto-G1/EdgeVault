import React, { useEffect, useState } from 'react';
import { getDashboardStats, getRecentActivity } from '../../api/dashboardService';
import type { StatCard, RecentActivity } from '../../types/dashboard';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Users, FileText, LogIn, ClipboardCheck, History, FolderOpen, Activity, Filter, TrendingUp, PieChart, Calendar } from 'lucide-react';
import { formatDistanceToNow, subDays, subYears, isAfter } from 'date-fns';
import styled from 'styled-components';
import FullPageLoader from '../../components/common/FullPageLoader';
import WelcomeCard from '../../components/common/WelcomeCard';

const iconMap: Record<string, React.ReactElement> = {
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
    const [stats, setStats] = useState<StatCard[]>([]);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filter states
    const [activityTimeFilter, setActivityTimeFilter] = useState<'7days' | '30days' | '1year' | 'all'>('7days');
    const [activityUserFilter, setActivityUserFilter] = useState<string>('all');
    const [documentGrowthFilter, setDocumentGrowthFilter] = useState<'7days' | '30days' | '1year' | 'all'>('30days');
    
    // Check if user has admin permissions
    const isAdmin = hasAnyPermission(['USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'ROLE_CREATE']);
    
    // Mock data for demonstration - in production, fetch from backend
    const fileTypeData = [
        { type: 'PDF', count: 145, color: '#ef4444' },
        { type: 'DOCX', count: 89, color: '#3b82f6' },
        { type: 'XLSX', count: 67, color: '#10b981' },
        { type: 'PPTX', count: 43, color: '#f59e0b' },
        { type: 'Images', count: 92, color: '#8b5cf6' },
        { type: 'Other', count: 34, color: '#6b7280' }
    ];
    
    const documentGrowthData = [
        { date: '2026-01-01', count: 234 },
        { date: '2026-01-15', count: 287 },
        { date: '2026-02-01', count: 345 },
        { date: '2026-02-11', count: 470 }
    ];

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
    
    // Get unique usernames for filter
    const uniqueUsers = Array.from(new Set(activities.map(a => a.username))).sort();
    
    // Filter activities based on time and user
    const filteredActivities = activities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        let timeMatch = true;
        
        // Apply time filter
        switch (activityTimeFilter) {
            case '7days':
                timeMatch = isAfter(activityDate, subDays(new Date(), 7));
                break;
            case '30days':
                timeMatch = isAfter(activityDate, subDays(new Date(), 30));
                break;
            case '1year':
                timeMatch = isAfter(activityDate, subYears(new Date(), 1));
                break;
            case 'all':
                timeMatch = true;
                break;
        }
        
        // Apply user filter (admins only)
        const userMatch = activityUserFilter === 'all' || activity.username === activityUserFilter;
        
        return timeMatch && userMatch;
    });
    
    // Filter document growth data based on time filter
    const filteredDocumentGrowth = documentGrowthData.filter(item => {
        const itemDate = new Date(item.date);
        switch (documentGrowthFilter) {
            case '7days':
                return isAfter(itemDate, subDays(new Date(), 7));
            case '30days':
                return isAfter(itemDate, subDays(new Date(), 30));
            case '1year':
                return isAfter(itemDate, subYears(new Date(), 1));
            case 'all':
                return true;
            default:
                return true;
        }
    });
    
    // Calculate totals for file types
    const totalFiles = fileTypeData.reduce((sum, item) => sum + item.count, 0);

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

            {/* Analytics Grid - Two Column Layout */}
            <AnalyticsGrid>
                {/* Recent Activity */}
                {activities.length > 0 && (
                    <ActivitySection>
                        <SectionHeader>
                            <SectionTitle>
                                <Activity size={24} />
                                {isAdmin ? 'Recent Activity' : 'My Recent Activity'}
                            </SectionTitle>
                            <FilterControls>
                                <FilterButton>
                                    <Filter size={16} />
                                    <FilterSelect 
                                        value={activityTimeFilter} 
                                        onChange={(e) => setActivityTimeFilter(e.target.value as any)}
                                    >
                                        <option value="7days">Last 7 Days</option>
                                        <option value="30days">Last 30 Days</option>
                                        <option value="1year">Last Year</option>
                                        <option value="all">All Time</option>
                                    </FilterSelect>
                                </FilterButton>
                                {isAdmin && (
                                    <FilterButton>
                                        <Users size={16} />
                                        <FilterSelect 
                                            value={activityUserFilter} 
                                            onChange={(e) => setActivityUserFilter(e.target.value)}
                                        >
                                            <option value="all">All Users</option>
                                            {uniqueUsers.map(username => (
                                                <option key={username} value={username}>{username}</option>
                                            ))}
                                        </FilterSelect>
                                    </FilterButton>
                                )}
                            </FilterControls>
                        </SectionHeader>
                        <ActivityList>
                            {filteredActivities.length > 0 ? (
                                filteredActivities.map((activity, index) => (
                                    <ActivityItem key={index} style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
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
                                ))
                            ) : (
                                <EmptyState>No activities found for the selected filters</EmptyState>
                            )}
                        </ActivityList>
                    </ActivitySection>
                )}
                
                {/* File Type Distribution */}
                <ChartSection>
                    <SectionHeader>
                        <SectionTitle>
                            <PieChart size={24} />
                            File Type Distribution
                        </SectionTitle>
                    </SectionHeader>
                    <FileTypeChart>
                        <FileTypeGrid>
                            {fileTypeData.map((item, index) => (
                                <FileTypeItem key={item.type} style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                                    <FileTypeBar>
                                        <FileTypeBarFill 
                                            $color={item.color}
                                            $percentage={(item.count / totalFiles) * 100}
                                        />
                                    </FileTypeBar>
                                    <FileTypeInfo>
                                        <FileTypeDot $color={item.color} />
                                        <FileTypeLabel>{item.type}</FileTypeLabel>
                                        <FileTypeCount>{item.count} files</FileTypeCount>
                                        <FileTypePercent>{Math.round((item.count / totalFiles) * 100)}%</FileTypePercent>
                                    </FileTypeInfo>
                                </FileTypeItem>
                            ))}
                        </FileTypeGrid>
                    </FileTypeChart>
                </ChartSection>
            </AnalyticsGrid>
            
            {/* Document Growth Timeline */}
            <ChartSection>
                <SectionHeader>
                    <SectionTitle>
                        <TrendingUp size={24} />
                        Document Growth Timeline
                    </SectionTitle>
                    <FilterControls>
                        <FilterButton>
                            <Calendar size={16} />
                            <FilterSelect 
                                value={documentGrowthFilter} 
                                onChange={(e) => setDocumentGrowthFilter(e.target.value as any)}
                            >
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="1year">Last Year</option>
                                <option value="all">All Time</option>
                            </FilterSelect>
                        </FilterButton>
                    </FilterControls>
                </SectionHeader>
                <TimelineChart>
                    {filteredDocumentGrowth.length > 0 ? (
                        <TimelineGrid>
                            {filteredDocumentGrowth.map((item, index) => {
                                const maxCount = Math.max(...filteredDocumentGrowth.map(d => d.count));
                                const height = (item.count / maxCount) * 100;
                                return (
                                    <TimelineBar key={item.date} style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
                                        <TimelineBarFill $height={height}>
                                            <TimelineValue>{item.count}</TimelineValue>
                                        </TimelineBarFill>
                                        <TimelineLabel>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TimelineLabel>
                                    </TimelineBar>
                                );
                            })}
                        </TimelineGrid>
                    ) : (
                        <EmptyState>No data available for the selected time period</EmptyState>
                    )}
                </TimelineChart>
            </ChartSection>
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
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

const AnalyticsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 40px;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    @media (max-width: 768px) {
        gap: 15px;
        margin-bottom: 30px;
    }
`;

const ActivitySection = styled.div`
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 4px 16px var(--shadow);
    font-family: 'Poppins', sans-serif;
    animation: slideUp 0.5s ease-out 0.4s backwards;
    display: flex;
    flex-direction: column;
    height: 100%;

    @media (max-width: 768px) {
        padding: 20px;
    }

    @media (max-width: 480px) {
        padding: 16px;
    }
`;

const ChartSection = styled.div`
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 4px 16px var(--shadow);
    font-family: 'Poppins', sans-serif;
    animation: slideUp 0.5s ease-out 0.5s backwards;

    @media (max-width: 768px) {
        padding: 20px;
    }

    @media (max-width: 480px) {
        padding: 16px;
    }
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;

    @media (max-width: 768px) {
        margin-bottom: 20px;
        gap: 12px;
    }

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;

    svg {
        color: var(--light-blue);
    }

    @media (max-width: 768px) {
        font-size: 18px;
        gap: 10px;
    }

    @media (max-width: 480px) {
        font-size: 16px;
        gap: 8px;
    }
`;

const FilterControls = styled.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    @media (max-width: 480px) {
        width: 100%;
        flex-direction: column;
        gap: 8px;
    }
`;

const FilterButton = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 8px 14px;
    transition: all 0.2s;

    svg {
        color: var(--text-secondary);
        flex-shrink: 0;
    }

    &:hover {
        border-color: var(--light-blue);
        background: var(--bg-secondary);
    }

    @media (max-width: 480px) {
        width: 100%;
        padding: 10px 14px;
    }
`;

const FilterSelect = styled.select`
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    outline: none;
    font-weight: 500;

    option {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    @media (max-width: 480px) {
        font-size: 13px;
        flex: 1;
    }
`;

const EmptyState = styled.div`
    padding: 40px 20px;
    text-align: center;
    color: var(--text-secondary);
    font-size: 14px;

    @media (max-width: 480px) {
        padding: 30px 15px;
        font-size: 13px;
    }
`;

const ActivityList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    max-height: 500px;
    flex: 1;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: var(--bg-primary);
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 10px;

        &:hover {
            background: var(--text-secondary);
        }
    }

    @media (max-width: 768px) {
        max-height: 400px;
    }

    @media (max-width: 480px) {
        max-height: 350px;
    }
`;

const ActivityItem = styled.li`
    padding: 16px 0;
    border-bottom: 1px solid var(--border-color);
    transition: all 0.2s ease;
    animation: slideUp 0.4s ease-out backwards;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: var(--bg-primary);
        margin-left: -12px;
        margin-right: -12px;
        padding-left: 12px;
        padding-right: 12px;
        border-radius: 8px;
        transform: translateX(4px);
    }

    .activity-main {
        font-size: 14px;
        color: var(--text-primary);
        margin-bottom: 6px;
        line-height: 1.5;

        @media (max-width: 480px) {
            font-size: 13px;
        }
    }

    .username {
        font-weight: 700;
        color: var(--light-blue);
    }

    .activity-details {
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.4;

        @media (max-width: 480px) {
            font-size: 12px;
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
        padding: 14px 0;
    }

    @media (max-width: 480px) {
        padding: 12px 0;
    }
`;

// File Type Distribution Styles
const FileTypeChart = styled.div`
    width: 100%;
`;

const FileTypeGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;

    @media (max-width: 480px) {
        gap: 12px;
    }
`;

const FileTypeItem = styled.div`
    animation: slideRight 0.5s ease-out backwards;

    @keyframes slideRight {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;

const FileTypeBar = styled.div`
    height: 12px;
    background: var(--bg-primary);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 8px;

    @media (max-width: 480px) {
        height: 10px;
    }
`;

const FileTypeBarFill = styled.div<{ $color: string; $percentage: number }>`
    height: 100%;
    background: ${props => props.$color};
    width: ${props => props.$percentage}%;
    transition: width 1s ease-out;
    border-radius: 6px;
`;

const FileTypeInfo = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 12px;

    @media (max-width: 480px) {
        gap: 8px;
    }
`;

const FileTypeDot = styled.div<{ $color: string }>`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.$color};
    flex-shrink: 0;

    @media (max-width: 480px) {
        width: 10px;
        height: 10px;
    }
`;

const FileTypeLabel = styled.span`
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);

    @media (max-width: 480px) {
        font-size: 13px;
    }
`;

const FileTypeCount = styled.span`
    font-size: 13px;
    color: var(--text-secondary);

    @media (max-width: 480px) {
        font-size: 12px;
    }
`;

const FileTypePercent = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);

    @media (max-width: 480px) {
        font-size: 13px;
    }
`;

// Document Growth Timeline Styles
const TimelineChart = styled.div`
    width: 100%;
    padding: 20px 0;

    @media (max-width: 480px) {
        padding: 15px 0;
    }
`;

const TimelineGrid = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    height: 250px;
    padding: 0 10px;

    @media (max-width: 768px) {
        height: 200px;
        gap: 12px;
    }

    @media (max-width: 480px) {
        height: 180px;
        gap: 8px;
        padding: 0 5px;
    }
`;

const TimelineBar = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    animation: growUp 0.8s ease-out backwards;

    @keyframes growUp {
        from {
            opacity: 0;
            transform: scaleY(0);
        }
        to {
            opacity: 1;
            transform: scaleY(1);
        }
    }
`;

const TimelineBarFill = styled.div<{ $height: number }>`
    width: 100%;
    max-width: 60px;
    height: ${props => props.$height}%;
    background: linear-gradient(to top, var(--light-blue), var(--purple));
    border-radius: 8px 8px 0 0;
    transition: height 1s ease-out;
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 8px;
    min-height: 40px;

    &:hover {
        background: linear-gradient(to top, var(--purple), var(--light-blue));
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.3);
    }

    @media (max-width: 768px) {
        max-width: 50px;
        border-radius: 6px 6px 0 0;
    }

    @media (max-width: 480px) {
        max-width: 40px;
        border-radius: 4px 4px 0 0;
        padding-top: 6px;
        min-height: 30px;
    }
`;

const TimelineValue = styled.span`
    font-size: 13px;
    font-weight: 700;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

    @media (max-width: 768px) {
        font-size: 12px;
    }

    @media (max-width: 480px) {
        font-size: 11px;
    }
`;

const TimelineLabel = styled.span`
    font-size: 12px;
    color: var(--text-secondary);
    text-align: center;
    font-weight: 500;
    white-space: nowrap;

    @media (max-width: 768px) {
        font-size: 11px;
    }

    @media (max-width: 480px) {
        font-size: 10px;
    }
`;

export default DashboardPage;