// client/src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import { useNotifications } from './NotificationContext';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Initial State
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { showNotification } = useNotifications();

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        const response = await authService.getMe();
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data?.user || response.user,
            token
          }
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_FAIL', payload: null });
      }
    };

    checkAuth();
  }, []);

  // Login function - UPDATED to match your response structure
// In AuthContext.js - update the login function to properly handle employee redirection
const login = async (credentials) => {
  dispatch({ type: 'AUTH_START' });
  
  try {
    console.log('🔄 AuthContext - Attempting login...');
    const response = await authService.login(credentials);
    console.log('✅ AuthContext - Login response:', response);
    
    const { data } = response;

    // Check if password change is required
    if (data.requiresPasswordChange) {
      console.log('🔐 AuthContext - Password change required');
      dispatch({ type: 'AUTH_FAIL', payload: null });
      
      return { 
        success: true, 
        requiresPasswordChange: true,
        tempToken: data.tempToken,
        user: data.user
      };
    }
    
    // Normal login - store token and authenticate
    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: data.user, token: data.token }
      });
      
      // Get redirect path based on user role
      const redirectPath = getRoleBasedRedirect(data.user.role);
      console.log(`🔄 AuthContext - Redirecting ${data.user.role} to: ${redirectPath}`);
      
      toast.success(`Welcome back, ${data.user.firstName}!`);
      return { 
        success: true, 
        user: data.user,
        redirectTo: redirectPath 
      };
    } else {
      throw new Error('Invalid response structure from server');
    }
    
  } catch (error) {
    console.error('❌ AuthContext - Login error:', error);
    
    // Handle different error types
    let errorMessage = 'Login failed';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    dispatch({
      type: 'AUTH_FAIL',
      payload: errorMessage
    });
    
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Add this helper function to AuthContext
const getRoleBasedRedirect = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'agent':
    case 'landlord':
      return '/agent/dashboard';
    case 'employee':
      return '/employee/dashboard';
    case 'tenant':
      return '/tenant/dashboard';
    case 'seeker':
      return '/';
    default:
      return '/';
  }
};
  // Register function
  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authService.register(userData);
      const token = response.data?.token || response.token;
      const user = response.data?.user || response.user;
      
      localStorage.setItem('token', token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      
      showNotification(`Welcome, ${user.firstName}!`, 'success');
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({
        type: 'AUTH_FAIL',
        payload: errorMessage
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
      showNotification('Logged out successfully', 'info');
    }
  };

  // Update user in context (after password change, etc)
  const updateUser = (user) => {
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: {
        user,
        token: state.token
      }
    });
  };
  // In AuthContext.js - add this method
const completePasswordChange = (user, token) => {
  console.log('🔄 AuthContext - Completing password change');
  localStorage.setItem('token', token);
  
  dispatch({
    type: 'AUTH_SUCCESS',
    payload: { user, token }
  });
  
  toast.success(`Welcome, ${user.firstName}! Password changed successfully.`);
};



  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateUser,
    completePasswordChange
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;