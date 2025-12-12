import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8082/api/v1', // Your backend URL
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable sending cookies with requests
});

// Interceptor to add the JWT token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // If we get a 401 or 403, clear the auth data
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Only clear if it's not a login request
            if (!error.config.url?.includes('/auth/login')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userPermissions');
                localStorage.removeItem('passwordChangeRequired');
                
                // Redirect to welcome page if not already there
                if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/auth')) {
                    window.location.href = '/';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

