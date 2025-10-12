// client/src/services/userService.js
import api from './api';

/**
 * User Service
 * Handles all user-related API calls
 */

const userService = {
  // Get all users (Admin only)
  getAllUsers: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/users?${params.toString()}`);
      

      return response;
     
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/change-password', passwordData);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create agent/landlord (Admin only)
  createAgent: async (agentData) => {
    try {
      const response = await api.post('/users/create-agent', agentData);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create employee (Agent/Landlord only)
  createEmployee: async (employeeData) => {
    try {
      const response = await api.post('/users/create-employee', employeeData);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get my employees
  getMyEmployees: async () => {
    try {
      const response = await api.get('/users/my-employees');
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user status (Admin only)
  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await api.put(`/users/${userId}/status`, { isActive });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user role (Admin only)
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/users/${userId}/role`, { role });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete user (Admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/users/verify-email', { token });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Resend verification email
  resendVerification: async () => {
    try {
      const response = await api.post('/users/resend-verification');
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default userService;