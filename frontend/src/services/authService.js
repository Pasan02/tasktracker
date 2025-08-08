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
      
      console.log('Registration response:', response); // Debug log
      
      // Fix: Handle the response structure correctly
      // Your backend returns { token, user } directly, not nested in data
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return {
        success: true,
        user: response.user,
        token: response.token
      };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
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
   * @param {Object} userData - Updated user data
   * @returns {Promise} - Updated user data
   */
  updateProfile: async (userData) => {
    try {
      // Get current user
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not found');
      }
      
      // Create the proper request object that matches UpdateProfileRequest on the backend
      const updateRequest = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || '',
        location: userData.location || '',
        avatar: userData.avatar || null
      };
      
      console.log('Sending profile update:', updateRequest);
      
      // Fix: Use the proper API endpoint from config
      const response = await apiClient.put(`/users/${user.id}`, updateRequest);
      
      // Update localStorage with the new user data
      const updatedUser = {
        ...user,
        firstName: updateRequest.firstName,
        lastName: updateRequest.lastName,
        phone: updateRequest.phone,
        location: updateRequest.location,
        avatar: updateRequest.avatar
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return {
        success: true,
        user: updatedUser
      };
    } catch (error) {
      console.error('Update profile error:', error);
      
      // Add more detailed error logging
      if (error.response) {
        console.error('Error response:', error.response);
      }
      
      // Implement the fallback
      try {
        // Local fallback - update user in localStorage only
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
          return { success: false, error: 'No user found in local storage' };
        }
        
        const updatedUser = {
          ...user,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone || user.phone || '',
          location: userData.location || user.location || '',
          avatar: userData.avatar || user.avatar || null
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return {
          success: true,
          user: updatedUser,
          warning: 'Profile updated locally only. Changes will not persist on the server.'
        };
      } catch (fallbackError) {
        console.error('Even fallback failed:', fallbackError);
        return {
          success: false,
          error: 'Failed to update profile both remotely and locally'
        };
      }
    }
  },

  /**
   * Update user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} - Success status
   */
  updatePassword: async (currentPassword, newPassword) => {
    try {
      // Get current user
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not found');
      }
      
      // Make the API call with the correct method (POST instead of PUT)
      const response = await apiClient.post(ENDPOINTS.USERS.PASSWORD(user.id), {
        currentPassword,
        newPassword
      });
      
      return {
        success: true,
        message: response.message || 'Password updated successfully'
      };
    } catch (error) {
      console.error('Update password error:', error);
      // Improve error handling to extract the correct message
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Failed to update password';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Update user profile with fallback
   * @param {Object} userData - Updated user data
   * @returns {Promise} - Updated user data
   */
  updateProfileWithFallback: async (userData) => {
    try {
      // Try to update via API first
      const result = await authService.updateProfile(userData);
      return result;
    } catch (error) {
      console.warn('API update failed, using local fallback', error);
      
      // Local fallback - update user in localStorage only
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        return { success: false, error: 'No user found in local storage' };
      }
      
      const updatedUser = {
        ...user,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || user.phone,
        location: userData.location || user.location,
        avatar: userData.avatar || user.avatar
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return {
        success: true,
        user: updatedUser,
        warning: 'Profile updated locally only. Changes will not persist on the server.'
      };
    }
  }
};

export default authService;