// client/src/services/authService.js
import { apiMethods } from './api';

const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await apiMethods.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await apiMethods.post('/auth/register', userData);
      console.log('Raw register response:', response);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // First login password change
  firstLoginChangePassword: async (data) => {
    try {
      const response = await apiMethods.post('/auth/first-login-change-password', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiMethods.get('/users/profile');
      return response.user;
    } catch (error) {
      throw error;
    }
  },

  // Get user via auth/me endpoint
  getMe: async () => {
    try {
      const response = await apiMethods.get('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiMethods.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await apiMethods.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await apiMethods.post('/auth/reset-password', { 
        token, 
        password 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update profile
  updateProfile: async (userData) => {
    try {
      const response = await apiMethods.patch('/auth/profile', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await apiMethods.upload('/auth/profile/image', formData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await apiMethods.post('/auth/verify-email', { token });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Resend verification email
  resendVerification: async () => {
    try {
      const response = await apiMethods.post('/auth/resend-verification');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await apiMethods.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage even if API fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // USER MANAGEMENT METHODS - ADDED:

  // Get all users with optional filters
  getAllUsers: async (filters = {}) => {
    try {
      const response = await apiMethods.get('/users', { params: filters });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get specific user details
  getUserDetails: async (userId) => {
    try {
      const response = await apiMethods.get(`/users/${userId}/details`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user status (active/inactive)
  updateUserStatus: async (userId, statusData) => {
    try {
      const response = await apiMethods.patch(`/users/${userId}/status`, statusData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await apiMethods.delete(`/users/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create agent/landlord (admin function)
  createAgent: async (userData) => {
    try {
      const response = await apiMethods.post('/users/agents', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user information
  updateUser: async (userId, userData) => {
    try {
      const response = await apiMethods.put(`/users/${userId}`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user hierarchy/stats
  getUserHierarchy: async (userId) => {
    try {
      const response = await apiMethods.get(`/users/${userId}/hierarchy`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user permissions
  getUserPermissions: async (userId) => {
    try {
      const response = await apiMethods.get(`/users/${userId}/permissions`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user permissions
  updateUserPermissions: async (userId, permissions) => {
    try {
      const response = await apiMethods.patch(`/users/${userId}/permissions`, permissions);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user activity/logs
  getUserActivity: async (userId, limit = 10) => {
    try {
      const response = await apiMethods.get(`/users/${userId}/activity`, { 
        params: { limit } 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Bulk update users
  bulkUpdateUsers: async (userIds, updateData) => {
    try {
      const response = await apiMethods.patch('/users/bulk-update', {
        userIds,
        updateData
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export users data
  exportUsers: async (filters = {}) => {
    try {
      const response = await apiMethods.get('/users/export', { 
        params: filters,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;