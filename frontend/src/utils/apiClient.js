import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT } from '../config/apiConfig';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with an error status
      if (error.response.status === 401) {
        // Unauthorized - clear local storage and redirect to login
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      return Promise.reject({
        status: error.response.status,
        message: error.response.data.message || 'An error occurred',
        data: error.response.data
      });
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        message: 'Server did not respond. Please check your connection.'
      });
    } else {
      // Error setting up the request
      return Promise.reject({
        message: error.message || 'An error occurred while setting up the request'
      });
    }
  }
);

export default apiClient;