import api from './axiosConfig';

export const getDocumentsByDepartment = async () => {
    const response = await api.get('/dashboard/visualizations/documents-by-department');
    return response.data;
};

export const getDailyActivity = async () => {
    const response = await api.get('/dashboard/visualizations/daily-activity');
    return response.data;
};

export const getDocumentGrowth = async () => {
    const response = await api.get('/dashboard/visualizations/document-growth');
    return response.data;
};

export const getDocumentsByStatus = async () => {
    const response = await api.get('/dashboard/visualizations/documents-by-status');
    return response.data;
};

export const getFileTypeDistribution = async () => {
    const response = await api.get('/dashboard/visualizations/file-type-distribution');
    return response.data;
};

export const getActivityHeatMap = async () => {
    const response = await api.get('/dashboard/visualizations/activity-heatmap');
    return response.data;
};

export const getStaleDocuments = async (daysThreshold: number = 90) => {
    const response = await api.get(`/dashboard/visualizations/stale-documents?daysThreshold=${daysThreshold}`);
    return response.data;
};
export const getTopActiveUsers = async () => {
  const response = await api.get('/dashboard/visualizations/top-active-users');
  return response.data;
};