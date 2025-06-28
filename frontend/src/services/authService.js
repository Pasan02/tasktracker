import apiClient from '../utils/apiClient';
import { ENDPOINTS } from '../config/apiConfig';

// Mock user data for development
const MOCK_USER = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'demo@wellife.com',
  avatar: null
};

const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - User data and token
   */
  login: async (email, password) => {
    try {
      // For demo/development, bypass actual API call
      if (email === 'demo@wellife.com' && password === 'password123') {
        const mockResponse = {
          user: MOCK_USER,
          token: 'mock-jwt-token'
        };
        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        return mockResponse;
      }

      // Real API call
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - User data and token
   */
  register: async (userData) => {
    try {
      // Prepare request data to match backend DTO
      const requestData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password
        // Don't send confirmPassword to the backend
      };
      
      const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, requestData);
      
      // If successful, save token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user info from token
   * @returns {Promise} - User data
   */
  getCurrentUser: async () => {
    try {
      // For demo/development, get from localStorage
      const user = localStorage.getItem('user');
      if (user) {
        return JSON.parse(user);
      }

      // Real API call
      const response = await apiClient.get(ENDPOINTS.AUTH.PROFILE);
      return response.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} - Updated user data
   */
  updateProfile: async (userId, userData) => {
    try {
      // For demo/development, update localStorage
      const user = localStorage.getItem('user');
      if (user) {
        const updatedUser = {...JSON.parse(user), ...userData};
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }

      // Real API call
      const response = await apiClient.put(`${ENDPOINTS.AUTH.PROFILE}/${userId}`, userData);
      return response.user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

export default authService;