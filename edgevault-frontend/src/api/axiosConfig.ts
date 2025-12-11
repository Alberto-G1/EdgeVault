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

export default apiClient;

