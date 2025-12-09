import React, { useEffect, useState } from 'react';
import { getDashboardStats, getRecentActivity } from '../../api/dashboardService';
import type { StatCard, RecentActivity } from '../../types/dashboard';
import { toast } from 'react-hot-toast';
import { Users, FileText, LogIn, ClipboardCheck, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const iconMap = {
    "Total Users": <Users className="h-8 w-8 text-blue-500" />,
    "Total Documents": <FileText className="h-8 w-8 text-green-500" />,
    "Total Logins Today": <LogIn className="h-8 w-8 text-purple-500" />,
    "Pending Approvals": <ClipboardCheck className="h-8 w-8 text-yellow-500" />,
};

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<StatCard[]>([]);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, activityData] = await Promise.all([
                    getDashboardStats(),
                    getRecentActivity()
                ]);
                setStats(statsData);
                setActivities(activityData);
            } catch (error) {
                toast.error("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Admin Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map(stat => (
                    <div key={stat.title} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                            {iconMap[stat.title] || <History />}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Activity</h2>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {activities.map((activity, index) => (
                        <li key={index} className="py-4">
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                <span className="font-bold">{activity.username}</span> {activity.action.toLowerCase().replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={activity.details}>
                                {activity.details}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DashboardPage;