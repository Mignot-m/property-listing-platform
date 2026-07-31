// Axios instance with JWT token interceptor for authenticated API requests
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://property-listing-platform-1y3u.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;