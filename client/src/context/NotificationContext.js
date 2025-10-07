import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null
};

// Notification context
const NotificationContext = createContext(initialState);

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_NOTIFICATIONS_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'FETCH_NOTIFICATIONS_SUCCESS':
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        isLoading: false,
        error: null
      };
    
    case 'FETCH_NOTIFICATIONS_FAIL':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    
    case 'ADD_NOTIFICATION':
      const newNotification = action.payload;
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: newNotification.read ? state.unreadCount : state.unreadCount + 1
      };
    
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true
        })),
        unreadCount: 0
      };
    
    case 'DELETE_NOTIFICATION':
      const deletedNotification = state.notifications.find(n => n._id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(notification =>
          notification._id !== action.payload
        ),
        unreadCount: deletedNotification && !deletedNotification.read 
          ? state.unreadCount - 1 
          : state.unreadCount
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };
    
    default:
      return state;
  }
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  // Fetch notifications function
  const fetchNotifications = async () => {
    dispatch({ type: 'FETCH_NOTIFICATIONS_START' });
    
    try {
      const data = await notificationService.getNotifications();
      dispatch({
        type: 'FETCH_NOTIFICATIONS_SUCCESS',
        payload: {
          notifications: data.notifications,
          unreadCount: data.unreadCount
        }
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_NOTIFICATIONS_FAIL',
        payload: error.response?.data?.message || 'Failed to fetch notifications'
      });
    }
  };

  // Add notification function
  const addNotification = (notification) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: notification
    });
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch({
        type: 'MARK_AS_READ',
        payload: notificationId
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      dispatch({
        type: 'DELETE_NOTIFICATION',
        payload: notificationId
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await notificationService.clearAllNotifications();
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  // Context value
  const value = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;