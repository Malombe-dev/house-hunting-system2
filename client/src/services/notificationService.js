import { apiMethods } from './api';

const notificationService = {
  // Get user notifications
  getNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await apiMethods.get(`/notifications?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    try {
      const response = await apiMethods.get('/notifications/unread-count');
      return response.count;
    } catch (error) {
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await apiMethods.patch(`/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await apiMethods.patch('/notifications/mark-all-read');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiMethods.delete(`/notifications/${notificationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    try {
      const response = await apiMethods.delete('/notifications/clear-all');
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default notificationService;