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

  // Get user details with hierarchy/stats
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/details`);
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
  updateUserStatus: async (userId, statusData) => {
    try {
      const response = await api.patch(`/users/${userId}/status`, statusData);
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

  // Update user information
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
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

  // Get user hierarchy/stats
  getUserHierarchy: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/hierarchy`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user permissions
  getUserPermissions: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/permissions`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user permissions
  updateUserPermissions: async (userId, permissions) => {
    try {
      const response = await api.patch(`/users/${userId}/permissions`, permissions);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user activity/logs
  getUserActivity: async (userId, limit = 10) => {
    try {
      const response = await api.get(`/users/${userId}/activity`, { 
        params: { limit } 
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Bulk update users
  bulkUpdateUsers: async (userIds, updateData) => {
    try {
      const response = await api.patch('/users/bulk-update', {
        userIds,
        updateData
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Export users data
  exportUsers: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/users/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (userId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post(`/users/${userId}/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Remove profile image
  removeProfileImage: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}/profile-image`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Search users
  searchUsers: async (query, filters = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/users/search?${params.toString()}`);
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
  },

  // Get user dashboard data
  getUserDashboard: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/dashboard`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reset user password (Admin only)
  resetUserPassword: async (userId) => {
    try {
      const response = await api.post(`/users/${userId}/reset-password`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user notifications
  getUserNotifications: async (userId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.read) params.append('read', filters.read);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.page) params.append('page', filters.page);

      const response = await api.get(`/users/${userId}/notifications?${params.toString()}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (userId, notificationId) => {
    try {
      const response = await api.patch(`/users/${userId}/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Clear all notifications
  clearAllNotifications: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}/notifications`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default userService;