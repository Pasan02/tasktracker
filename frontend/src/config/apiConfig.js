/**
 * API configuration for the application
 */

// Base URL for all API requests
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Default request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000;

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  
  // Task endpoints
  TASKS: {
    BASE: '/tasks',
    BY_ID: (id) => `/tasks/${id}`,
    TODAY: '/tasks/today',
    UPCOMING: '/tasks/upcoming',
  },
  
  // Habit endpoints
  HABITS: {
    BASE: '/habits',
    BY_ID: (id) => `/habits/${id}`,
    COMPLETIONS: '/habits/completions',
    MARK_COMPLETE: (id) => `/habits/${id}/complete`,
  },
};