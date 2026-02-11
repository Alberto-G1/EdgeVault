import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts';
import * as visualizationService from '../../api/visualizationService';
import { format, subDays, subYears, startOfDay } from 'date-fns';
import { Activity, TrendingUp, PieChart as PieChartIcon, BarChart as BarChartIcon, Calendar, Clock, FileText, Users as UsersIcon, Shield, Download, RefreshCw } from 'lucide-react';
import Loader from '../../components/common/Loader';
import { useTheme } from '../../hooks/useTheme';
import { usePermissions } from '../../hooks/usePermissions';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  animation: fadeInUp 0.4s ease;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(70, 180, 230, 0.1), rgba(52, 152, 219, 0.1))'
    : 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(14, 165, 233, 0.05))'};
  border-radius: 20px;
  border: 2px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(70, 180, 230, 0.2)' 
    : 'rgba(14, 165, 233, 0.1)'};

  @media (max-width: 768px) {
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 16px;
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(135deg, #46b4e6, #3498db)'
    : 'linear-gradient(135deg, #06b6d4, #0ea5e9)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Poppins', sans-serif;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
    gap: 0.5rem;

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const PageDescription = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.text.secondary};
  font-family: 'Poppins', sans-serif;
  margin-left: 3.5rem;
  max-width: 800px;

  @media (max-width: 768px) {
    font-size: 0.875rem;
    margin-left: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 0.813rem;
    margin-left: 0;
    margin-top: 0.5rem;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme.backgrounds.secondary};
  border-radius: 16px;
  border: 2px solid ${props => props.theme.border};
  box-shadow: 0 4px 12px ${props => props.theme.shadow};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: ${props => props.theme.buttonGradient};
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.theme.mode === 'dark'
      ? 'rgba(70, 180, 230, 0.4)'
      : 'rgba(6, 182, 212, 0.3)'};
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 1.25rem;
    font-size: 0.875rem;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
`;

const StatCard = styled.div`
  padding: 1.5rem;
  background: ${props => props.theme.backgrounds.secondary};
  border: 2px solid;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px ${props => props.theme.shadow};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px ${props => props.theme.mode === 'dark'
      ? 'rgba(0, 0, 0, 0.4)'
      : 'rgba(0, 0, 0, 0.1)'};
  }
`;

const StatIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
  font-family: 'Poppins', sans-serif;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${props => props.theme.text.primary};
  font-family: 'Poppins', sans-serif;
`;

const VisualizationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) {
    gap: 1rem;
  }

  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
`;

const VisualizationCard = styled.div`
  background: ${props => props.theme.backgrounds.secondary};
  border: 2px solid ${props => props.theme.border};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px ${props => props.theme.shadow};
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px ${props => props.theme.mode === 'dark'
      ? 'rgba(0, 0, 0, 0.5)'
      : 'rgba(0, 0, 0, 0.12)'};
  }
`;

const FullWidthCard = styled(VisualizationCard)`
  grid-column: 1 / -1;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${props => props.theme.border};
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.text.primary};
  font-family: 'Poppins', sans-serif;
  flex: 1;
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.text.secondary};
  margin-bottom: 1.5rem;
  font-family: 'Poppins', sans-serif;
  line-height: 1.5;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem;
  background: ${props => props.theme.backgrounds.secondary};
  border-radius: 16px;
  border: 2px solid rgba(239, 68, 68, 0.2);
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  margin: 0 auto 1.5rem;
`;

const ErrorText = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.text.primary};
  margin-bottom: 0.5rem;
  font-family: 'Poppins', sans-serif;
`;

const ErrorSubtext = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.text.secondary};
  font-family: 'Poppins', sans-serif;
  margin-bottom: 1.5rem;
`;

const RetryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: ${props => props.theme.buttonGradient};
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.theme.mode === 'dark'
      ? 'rgba(70, 180, 230, 0.4)'
      : 'rgba(6, 182, 212, 0.3)'};
  }
`;

const HeatMapContainer = styled.div`
  background: ${props => props.theme.backgrounds.secondary};
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid ${props => props.theme.border};
  overflow-x: auto;

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const HeatMapGrid = styled.div`
  display: grid;
  grid-template-columns: 50px repeat(24, 1fr);
  grid-template-rows: 30px repeat(7, 40px);
  gap: 2px;
  margin-top: 1rem;
  min-width: 800px;

  @media (max-width: 768px) {
    grid-template-columns: 40px repeat(24, 1fr);
    grid-template-rows: 25px repeat(7, 35px);
    gap: 1px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 35px repeat(24, 1fr);
    grid-template-rows: 22px repeat(7, 30px);
  }
`;

const HeatMapCell = styled.div<{ intensity: number; $isDark?: boolean }>`
  background-color: ${props => {
    const isDark = props.$isDark;
    if (props.intensity === 0) return isDark ? '#1e293b' : '#f8fafc';
    if (props.intensity < 5) return isDark ? '#1e3a5f' : '#e0f2fe';
    if (props.intensity < 10) return isDark ? '#2d5a8f' : '#bae6fd';
    if (props.intensity < 20) return isDark ? '#3b7bbf' : '#7dd3fc';
    if (props.intensity < 30) return isDark ? '#46b4e6' : '#38bdf8';
    if (props.intensity < 40) return isDark ? '#3498db' : '#0ea5e9';
    if (props.intensity < 50) return isDark ? '#2980b9' : '#0284c7';
    return isDark ? '#1f5f8b' : '#0369a1';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: ${props => props.intensity > 10 ? 'white' : (props.$isDark ? '#e0e0e0' : '#1e293b')};
  border-radius: 6px;
  transition: all 0.2s;
  cursor: pointer;
  font-weight: ${props => props.intensity > 0 ? 600 : 400};

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  @media (max-width: 768px) {
    font-size: 0.688rem;
    border-radius: 4px;
  }

  @media (max-width: 480px) {
    font-size: 0.625rem;
    border-radius: 3px;
  }
`;

const HeatMapLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: ${props => props.theme.text.secondary};
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
`;

const TableContainer = styled.div`
  background: ${props => props.theme.backgrounds.secondary};
  border-radius: 12px;
  border: 2px solid ${props => props.theme.border};
  overflow: hidden;
  overflow-x: auto;

  @media (max-width: 768px) {
    border-radius: 10px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;

  @media (max-width: 768px) {
    min-width: 500px;
    font-size: 0.875rem;
  }
`;

const TableHeader = styled.thead`
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(70, 180, 230, 0.08), rgba(52, 152, 219, 0.08))'
    : 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(14, 165, 233, 0.05))'};
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: ${props => props.theme.text.primary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Poppins', sans-serif;
  border-bottom: 2px solid ${props => props.theme.border};

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    font-size: 0.813rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 0.75rem;
    font-size: 0.75rem;
  }
`;

const Td = styled.td`
  padding: 1rem 1.5rem;
  font-size: 0.9375rem;
  color: ${props => props.theme.text.primary};
  font-family: 'Poppins', sans-serif;
  border-bottom: 1px solid ${props => props.theme.border};

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 0.75rem;
    font-size: 0.813rem;
  }
`;

const Tr = styled.tr`
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(70, 180, 230, 0.05)'
      : 'rgba(14, 165, 233, 0.02)'};
  }

  &:last-child {
    td {
      border-bottom: none;
    }
  }
`;

const FilterControls = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const FilterButton = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.theme.backgrounds.primary};
  border: 1px solid ${props => props.theme.border};
  border-radius: 10px;
  padding: 8px 14px;
  transition: all 0.2s;

  svg {
    color: ${props => props.theme.text.secondary};
    flex-shrink: 0;
  }

  &:hover {
    border-color: ${props => props.theme.mode === 'dark' ? '#46b4e6' : '#06b6d4'};
    background: ${props => props.theme.backgrounds.secondary};
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 10px 14px;
  }
`;

const FilterSelect = styled.select`
  background: transparent;
  border: none;
  color: ${props => props.theme.text.primary};
  font-size: 14px;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  outline: none;
  font-weight: 500;

  option {
    background: ${props => props.theme.backgrounds.secondary};
    color: ${props => props.theme.text.primary};
  }

  @media (max-width: 480px) {
    font-size: 13px;
    flex: 1;
  }
`;

const VisualizationsPage: React.FC = () => {
  const { mode, theme } = useTheme();
  const { hasAnyPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Filter states
  const [activityTimeFilter, setActivityTimeFilter] = useState<'7days' | '30days' | '1year' | 'all'>('7days');
  const [activityUserFilter, setActivityUserFilter] = useState<string>('all');
  const [growthTimeFilter, setGrowthTimeFilter] = useState<'30days' | '1year' | 'all'>('30days');

  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [fileTypeData, setFileTypeData] = useState<any[]>([]);
  const [heatMapData, setHeatMapData] = useState<any[]>([]);
  const [staleDocuments, setStaleDocuments] = useState<any[]>([]);
  const [topActiveUsers, setTopActiveUsers] = useState<any[]>([]);
  
  // Check if user has admin permissions
  const isAdmin = hasAnyPermission(['USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'ROLE_CREATE']);

  // Theme-aware color palettes
  const CHART_COLORS = mode === 'dark' ? {
    // Dark theme - vibrant colors
    donut: ['#46b4e6', '#9681a3', '#e59736', '#f59e0b', '#34d399', '#8b5cf6', '#ec4899', '#f472b6', '#a78bfa'],
    activity: '#46b4e6',
    growth: '#34d399',
    status: '#9681a3',
    topUsers: '#8b5cf6',
    fileType: ['#46b4e6', '#9681a3', '#e59736', '#34d399', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f472b6'],
    grid: theme.text.secondary,
    text: theme.text.primary,
  } : {
    // Light theme - softer colors
    donut: ['#06b6d4', '#9681a3', '#e59736', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#f472b6', '#a78bfa'],
    activity: '#0ea5e9',
    growth: '#10b981',
    status: '#9681a3',
    topUsers: '#8b5cf6',
    fileType: ['#06b6d4', '#9681a3', '#e59736', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#0ea5e9', '#f472b6'],
    grid: '#e5e7eb',
    text: theme.text.primary,
  };

  const loadAllVisualizations = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        deptData,
        actData,
        grwData,
        stsData,
        ftData,
        hmData,
        sdData,
        topUsers
      ] = await Promise.all([
        visualizationService.getDocumentsByDepartment(),
        visualizationService.getDailyActivity(),
        visualizationService.getDocumentGrowth(),
        visualizationService.getDocumentsByStatus(),
        visualizationService.getFileTypeDistribution(),
        visualizationService.getActivityHeatMap(),
        visualizationService.getStaleDocuments(90),
        visualizationService.getTopActiveUsers()
      ]);

      setDepartmentData(deptData);
      setActivityData(actData);
      setGrowthData(grwData);
      setStatusData(stsData);
      setFileTypeData(ftData);
      setHeatMapData(hmData);
      setStaleDocuments(sdData);
      setTopActiveUsers(topUsers);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load visualizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllVisualizations();
  }, []);
  
  // Get unique usernames for filter
  const uniqueUsers = Array.from(new Set(activityData.map((a: any) => a.username || 'Unknown'))).sort();
  
  // Filter activity data based on time and user
  const filteredActivityData = activityData.filter((activity: any) => {
    const activityDate = new Date(activity.date);
    const now = new Date();
    let timeMatch = true;
    
    // Apply time filter using timestamp comparison (>= instead of strictly >)
    switch (activityTimeFilter) {
      case '7days':
        const sevenDaysAgo = startOfDay(subDays(now, 7));
        timeMatch = activityDate.getTime() >= sevenDaysAgo.getTime();
        break;
      case '30days':
        const thirtyDaysAgo = startOfDay(subDays(now, 30));
        timeMatch = activityDate.getTime() >= thirtyDaysAgo.getTime();
        break;
      case '1year':
        const oneYearAgo = startOfDay(subYears(now, 1));
        timeMatch = activityDate.getTime() >= oneYearAgo.getTime();
        break;
      case 'all':
        timeMatch = true;
        break;
    }
    
    // Apply user filter (admins only)
    const userMatch = activityUserFilter === 'all' || activity.username === activityUserFilter;
    
    return timeMatch && (isAdmin ? userMatch : true);
  });
  
  // Filter document growth data based on time filter
  const filteredGrowthData = growthData.filter((item: any) => {
    const itemDate = new Date(item.period);
    const now = new Date();
    
    switch (growthTimeFilter) {
      case '30days':
        const thirtyDaysAgo = startOfDay(subDays(now, 30));
        return itemDate.getTime() >= thirtyDaysAgo.getTime();
      case '1year':
        const oneYearAgo = startOfDay(subYears(now, 1));
        return itemDate.getTime() >= oneYearAgo.getTime();
      case 'all':
        return true;
      default:
        return true;
    }
  });

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getTotalDocuments = () => {
    return departmentData.reduce((acc, dept) => acc + dept.documentCount, 0);
  };

  const getTotalSize = () => {
    return fileTypeData.reduce((acc, file) => acc + file.totalSize, 0);
  };

  const getTotalActivities = () => {
    return activityData.reduce((acc, day) => acc + day.activityCount, 0);
  };

  const renderHeatMap = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const dataMap = new Map<string, number>();
    heatMapData.forEach(item => {
      const key = `${item.dayOfWeek}-${item.hour}`;
      dataMap.set(key, item.activityCount);
    });

    return (
      <HeatMapContainer>
        <HeatMapGrid>
          <HeatMapLabel />
          {hours.map(hour => (
            <HeatMapLabel key={`hour-${hour}`}>
              {hour.toString().padStart(2, '0')}
            </HeatMapLabel>
          ))}

          {days.map((day, dayIndex) => (
            <React.Fragment key={`day-${dayIndex}`}>
              <HeatMapLabel>{day}</HeatMapLabel>
              {hours.map(hour => {
                const key = `${dayIndex + 1}-${hour}`;
                const intensity = dataMap.get(key) || 0;
                return (
                  <HeatMapCell
                    key={key}
                    intensity={intensity}
                    $isDark={mode === 'dark'}
                    title={`${day} ${hour}:00 - ${intensity} activities`}
                  >
                    {intensity > 0 ? intensity : ''}
                  </HeatMapCell>
                );
              })}
            </React.Fragment>
          ))}
        </HeatMapGrid>
      </HeatMapContainer>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <Loader />
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>
            <Activity size={32} />
            System Analytics
          </PageTitle>
          <PageDescription>
            Comprehensive insights into document management, system activity, and storage utilization
          </PageDescription>
        </PageHeader>
        
        <ErrorMessage>
          <ErrorIcon>
            <Activity size={32} />
          </ErrorIcon>
          <ErrorText>Failed to Load Visualizations</ErrorText>
          <ErrorSubtext>{error}</ErrorSubtext>
          <RetryButton onClick={loadAllVisualizations}>
            <RefreshCw size={16} />
            Try Again
          </RetryButton>
        </ErrorMessage>
      </PageContainer>
    );
  }

  return (
    <StyledThemeProvider theme={{ ...theme, mode }}>
      <PageContainer>
        <PageHeader>
          <PageTitle>
            <Activity size={32} />
            System Analytics & Visualizations
          </PageTitle>
          <PageDescription>
            Comprehensive insights into document management, system activity, and storage utilization
          </PageDescription>
        </PageHeader>

      <ControlsContainer>
        <div>
          <div style={{ fontSize: '0.875rem', color: theme.text.secondary, fontFamily: "'Poppins', sans-serif" }}>
            Last updated: {format(lastUpdated, 'PPpp')}
          </div>
        </div>
        
        <RefreshButton onClick={loadAllVisualizations}>
          <RefreshCw size={18} />
          Refresh Data
        </RefreshButton>
      </ControlsContainer>

      <StatsContainer>
        <StatCard style={{ borderColor: mode === 'dark' ? 'rgba(70, 180, 230, 0.3)' : 'rgba(6, 182, 212, 0.2)' }}>
          <StatIcon style={{ 
            background: mode === 'dark' ? 'rgba(70, 180, 230, 0.15)' : 'rgba(6, 182, 212, 0.1)', 
            color: mode === 'dark' ? '#46b4e6' : '#06b6d4' 
          }}>
            <FileText size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Total Documents</StatLabel>
            <StatValue>{getTotalDocuments().toLocaleString()}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard style={{ borderColor: mode === 'dark' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(14, 165, 233, 0.2)' }}>
          <StatIcon style={{ 
            background: mode === 'dark' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(14, 165, 233, 0.1)', 
            color: mode === 'dark' ? '#34d399' : '#0ea5e9' 
          }}>
            <Activity size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Total Activities</StatLabel>
            <StatValue>{getTotalActivities().toLocaleString()}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard style={{ borderColor: mode === 'dark' ? 'rgba(150, 129, 158, 0.3)' : 'rgba(56, 189, 248, 0.2)' }}>
          <StatIcon style={{ 
            background: mode === 'dark' ? 'rgba(150, 129, 158, 0.15)' : 'rgba(56, 189, 248, 0.1)', 
            color: mode === 'dark' ? '#9681a3' : '#38bdf8' 
          }}>
            <Download size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Storage Used</StatLabel>
            <StatValue>{formatBytes(getTotalSize())}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard style={{ borderColor: mode === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(103, 232, 249, 0.2)' }}>
          <StatIcon style={{ 
            background: mode === 'dark' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(103, 232, 249, 0.1)', 
            color: mode === 'dark' ? '#8b5cf6' : '#67e8f9' 
          }}>
            <UsersIcon size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Active Users</StatLabel>
            <StatValue>{topActiveUsers.length}</StatValue>
          </StatContent>
        </StatCard>
      </StatsContainer>

      <VisualizationsGrid>
        {/* Documents by Department - Donut Chart */}
        <VisualizationCard>
          <CardHeader>
            <CardIcon style={{ 
              background: mode === 'dark' ? 'rgba(70, 180, 230, 0.15)' : 'rgba(6, 182, 212, 0.1)', 
              color: mode === 'dark' ? '#46b4e6' : '#06b6d4' 
            }}>
              <PieChartIcon size={24} />
            </CardIcon>
            <CardTitle>Documents by Department</CardTitle>
          </CardHeader>
          <CardDescription>
            Distribution of documents across departments - identify heavy users and storage patterns
          </CardDescription>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                dataKey="documentCount"
                nameKey="departmentName"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                label={(entry: any) => `${entry.departmentName}: ${entry.documentCount}`}
              >
                {departmentData.map((_entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHART_COLORS.donut[index % CHART_COLORS.donut.length]}
                    stroke={mode === 'dark' ? '#252839' : '#fff'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'white',
                  border: '2px solid rgba(14, 165, 233, 0.1)',
                  borderRadius: '12px',
                  fontFamily: "'Poppins', sans-serif"
                }}
              />
              <Legend 
                wrapperStyle={{ fontFamily: "'Poppins', sans-serif" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </VisualizationCard>

        {/* Daily Activity Last 7 Days - Area Chart */}
        <VisualizationCard>
          <CardHeader>
            <CardIcon style={{ 
              background: mode === 'dark' ? 'rgba(70, 180, 230, 0.15)' : 'rgba(14, 165, 233, 0.1)', 
              color: mode === 'dark' ? '#46b4e6' : '#0ea5e9' 
            }}>
              <Activity size={24} />
            </CardIcon>
            <CardTitle>{isAdmin ? 'System Activity' : 'My Recent Activity'}</CardTitle>
          </CardHeader>
          <CardDescription>
            {isAdmin ? 'System activity trends - monitor usage and engagement' : 'Your activity over the selected time period'}
          </CardDescription>
          <FilterControls>
            <FilterButton>
              <Calendar size={16} />
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
            {isAdmin && uniqueUsers.length > 0 && (
              <FilterButton>
                <UsersIcon size={16} />
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
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis 
                dataKey="date" 
                stroke={CHART_COLORS.text}
                fontFamily="'Poppins', sans-serif"
                fontSize={12}
              />
              <YAxis 
                stroke={CHART_COLORS.text}
                fontFamily="'Poppins', sans-serif"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  background: theme.backgrounds.secondary,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '12px',
                  fontFamily: "'Poppins', sans-serif",
                  color: theme.text.primary
                }}
              />
              <Legend 
                wrapperStyle={{ fontFamily: "'Poppins', sans-serif" }}
              />
              <Area 
                type="monotone" 
                dataKey="activityCount" 
                stroke={CHART_COLORS.activity} 
                fill="url(#colorActivity)"
                strokeWidth={2}
                name="Activities"
              />
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.activity} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={CHART_COLORS.activity} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </VisualizationCard>

        {/* Document Growth Over Time - Line Chart */}
        <VisualizationCard>
          <CardHeader>
            <CardIcon style={{ 
              background: mode === 'dark' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(56, 189, 248, 0.1)', 
              color: mode === 'dark' ? '#34d399' : '#38bdf8' 
            }}>
              <TrendingUp size={24} />
            </CardIcon>
            <CardTitle>Document Growth Timeline</CardTitle>
          </CardHeader>
          <CardDescription>
            Cumulative document growth - track adoption and plan capacity requirements
          </CardDescription>
          <FilterControls>
            <FilterButton>
              <Calendar size={16} />
              <FilterSelect 
                value={growthTimeFilter} 
                onChange={(e) => setGrowthTimeFilter(e.target.value as any)}
              >
                <option value="30days">Last 30 Days</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </FilterSelect>
            </FilterButton>
          </FilterControls>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis 
                dataKey="period" 
                stroke={CHART_COLORS.text}
                fontFamily="'Poppins', sans-serif"
                fontSize={12}
              />
              <YAxis 
                stroke={CHART_COLORS.text}
                fontFamily="'Poppins', sans-serif"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  background: theme.backgrounds.secondary,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '12px',
                  fontFamily: "'Poppins', sans-serif",
                  color: theme.text.primary
                }}
              />
              <Legend 
                wrapperStyle={{ fontFamily: "'Poppins', sans-serif" }}
              />
              <Line 
                type="monotone" 
                dataKey="totalDocuments" 
                stroke={CHART_COLORS.growth} 
                strokeWidth={3}
                name="Total Documents"
                dot={{ stroke: CHART_COLORS.growth, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8, stroke: CHART_COLORS.growth, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </VisualizationCard>

        {/* Documents by Status - Radial Bar Chart */}
        <VisualizationCard>
          <CardHeader>
            <CardIcon style={{ 
              background: mode === 'dark' ? 'rgba(150, 129, 158, 0.15)' : 'rgba(103, 232, 249, 0.1)', 
              color: mode === 'dark' ? '#9681a3' : '#67e8f9' 
            }}>
              <Shield size={24} />
            </CardIcon>
            <CardTitle>Documents by Status</CardTitle>
          </CardHeader>
          <CardDescription>
            Document lifecycle breakdown - monitor workflow and pending deletions
          </CardDescription>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart 
              innerRadius="10%" 
              outerRadius="90%" 
              data={statusData} 
              startAngle={180} 
              endAngle={0}
            >
              <RadialBar
                label={{
                  position: 'insideStart', 
                  fill: '#fff',
                  fontFamily: "'Poppins', sans-serif"
                }} 
                background 
                dataKey="count" 
              >
                {statusData.map((_entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHART_COLORS.donut[index % CHART_COLORS.donut.length]}
                  />
                ))}
              </RadialBar>
              <Tooltip 
                contentStyle={{ 
                  background: theme.backgrounds.secondary,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '12px',
                  fontFamily: "'Poppins', sans-serif",
                  color: theme.text.primary
                }}
              />
              <Legend 
                wrapperStyle={{ fontFamily: "'Poppins', sans-serif" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </VisualizationCard>

        {/* Top 5 Most Active Users - Bar Chart */}
        <VisualizationCard>
          <CardHeader>
            <CardIcon style={{ 
              background: mode === 'dark' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(6, 182, 212, 0.1)', 
              color: mode === 'dark' ? '#8b5cf6' : '#06b6d4' 
            }}>
              <UsersIcon size={24} />
            </CardIcon>
            <CardTitle>Top 5 Most Active Users</CardTitle>
          </CardHeader>
          <CardDescription>
            Users with highest activity in the last 30 days - identify power users and engagement
          </CardDescription>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topActiveUsers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis 
                type="number" 
                stroke={CHART_COLORS.text}
                fontFamily="'Poppins', sans-serif"
              />
              <YAxis 
                dataKey="username" 
                type="category" 
                width={100}
                stroke={CHART_COLORS.text}
                fontFamily="'Poppins', sans-serif"
              />
              <Tooltip 
                contentStyle={{ 
                  background: theme.backgrounds.secondary,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '12px',
                  fontFamily: "'Poppins', sans-serif",
                  color: theme.text.primary
                }}
              />
              <Legend 
                wrapperStyle={{ fontFamily: "'Poppins', sans-serif" }}
              />
              <Bar 
                dataKey="activityCount" 
                fill="url(#colorUser)" 
                name="Activities"
                radius={[0, 10, 10, 0]}
              />
              <defs>
                <linearGradient id="colorUser" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={CHART_COLORS.topUsers} stopOpacity={1}/>
                  <stop offset="100%" stopColor={mode === 'dark' ? '#a78bfa' : '#a855f7'} stopOpacity={1}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </VisualizationCard>

        {/* File Type Distribution - Improved Bar Chart */}
        <FullWidthCard>
          <CardHeader>
            <CardIcon style={{ 
              background: mode === 'dark' ? 'rgba(229, 151, 54, 0.15)' : 'rgba(14, 165, 233, 0.1)', 
              color: mode === 'dark' ? '#e59736' : '#0ea5e9' 
            }}>
              <BarChartIcon size={24} />
            </CardIcon>
            <CardTitle>File Type Distribution & Storage</CardTitle>
          </CardHeader>
          <CardDescription>
            Storage utilization by file type - identify what consumes the most space and optimize storage
          </CardDescription>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={fileTypeData} layout="vertical" margin={{ left: 20, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis 
                type="number"
                stroke={CHART_COLORS.text}
                fontFamily="'Poppins', sans-serif"
                fontSize={12}
                tickFormatter={(value) => formatBytes(value)}
              />
              <YAxis 
                dataKey="fileType" 
                type="category"
                width={80}
                stroke={CHART_COLORS.text}
                fontFamily="'Poppins', sans-serif"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  background: theme.backgrounds.secondary,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '12px',
                  fontFamily: "'Poppins', sans-serif",
                  color: theme.text.primary
                }}
                formatter={(value: any, name?: string) => {
                  if (name === 'Storage') return formatBytes(value);
                  return value;
                }}
              />
              <Legend 
                wrapperStyle={{ fontFamily: "'Poppins', sans-serif" }}
              />
              <Bar 
                dataKey="totalSize" 
                name="Storage"
                radius={[0, 10, 10, 0]}
              >
                {fileTypeData.map((_entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHART_COLORS.fileType[index % CHART_COLORS.fileType.length]}
                  />
                ))}
              </Bar>
              <Bar 
                dataKey="count" 
                name="File Count"
                radius={[0, 10, 10, 0]}
              >
                {fileTypeData.map((_entry, index) => (
                  <Cell 
                    key={`cell-count-${index}`} 
                    fill={`${CHART_COLORS.fileType[index % CHART_COLORS.fileType.length]}80`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </FullWidthCard>

        {/* Activity Heat Map */}
        <FullWidthCard>
          <CardHeader>
            <CardIcon style={{ 
              background: mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.1)', 
              color: mode === 'dark' ? '#f59e0b' : '#38bdf8' 
            }}>
              <Calendar size={24} />
            </CardIcon>
            <CardTitle>System Activity Heat Map</CardTitle>
          </CardHeader>
          <CardDescription>
            Activity intensity by day and hour - identify peak usage times and potential security anomalies
          </CardDescription>
          {renderHeatMap()}
        </FullWidthCard>

        {/* Stale Documents Table */}
        <FullWidthCard>
          <CardHeader>
            <CardIcon style={{ 
              background: mode === 'dark' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(103, 232, 249, 0.1)', 
              color: mode === 'dark' ? '#ec4899' : '#67e8f9' 
            }}>
              <Clock size={24} />
            </CardIcon>
            <CardTitle>Stale Documents (90+ Days)</CardTitle>
          </CardHeader>
          <CardDescription>
            Documents not modified in over 90 days - potential candidates for archival or deletion
          </CardDescription>
          {staleDocuments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#64748b',
              fontFamily: "'Poppins', sans-serif" 
            }}>
              No stale documents found
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <tr>
                    <Th>Document Title</Th>
                    <Th>Department</Th>
                    <Th>Last Modified</Th>
                    <Th>Days Since Modification</Th>
                  </tr>
                </TableHeader>
                <tbody>
                  {staleDocuments.map((doc) => (
                    <Tr key={doc.id}>
                      <Td>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          fontWeight: 500 
                        }}>
                          <FileText size={14} color="#64748b" />
                          {doc.title}
                        </div>
                      </Td>
                      <Td>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem' 
                        }}>
                          <UsersIcon size={14} color="#64748b" />
                          {doc.departmentName}
                        </div>
                      </Td>
                      <Td>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem' 
                        }}>
                          <Calendar size={14} color="#64748b" />
                          {format(new Date(doc.lastModified), 'PP')}
                        </div>
                      </Td>
                      <Td>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: doc.daysSinceModified > 180 ? '#ef4444' : '#f59e0b',
                          fontWeight: 600
                        }}>
                          <Clock size={14} />
                          {doc.daysSinceModified} days
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          )}
        </FullWidthCard>
      </VisualizationsGrid>
    </PageContainer>
    </StyledThemeProvider>
  );
};

export default VisualizationsPage;