/**
 * API configuration for the application
 */

// Base URL for all API requests
export const API_BASE_URL = 'http://localhost:8080/api';

// Default request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000;

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    VALIDATE: '/auth/validate'
  },
  
  // Users endpoints
  USERS: {
    BASE: '/users',
    CURRENT: '/users/current',
    BY_ID: (id) => `/users/${id}`,
    PASSWORD: (id) => `/users/${id}/password`
  },
  
  // Tasks endpoints
  TASKS: {
    BASE: '/tasks',
    BY_ID: (id) => `/tasks/${id}`,
    BY_USER: (userId) => `/tasks/user/${userId}`,
    BY_USER_AND_DATE: (userId, date) => `/tasks/user/${userId}/date/${date}`,
    BY_USER_AND_STATUS: (userId, status) => `/tasks/user/${userId}/status/${status}`,
    UPCOMING: (userId) => `/tasks/user/${userId}/upcoming`,
    OVERDUE: (userId) => `/tasks/user/${userId}/overdue`
  },
  
  // Habits endpoints
  HABITS: {
    BASE: '/habits',
    BY_ID: (id) => `/habits/${id}`,
    BY_USER: (userId) => `/habits/user/${userId}`,
    MARK_COMPLETE: (habitId) => `/habits/${habitId}/complete`,
    COMPLETIONS: '/habits/completions'
  }
};