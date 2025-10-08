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

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiMethods.get('/auth/me');
      return response.user;
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

  // Logout user (client-side only)
  logout: () => {
    localStorage.removeItem('token');
    // Clear any other stored data
    localStorage.removeItem('user');
  }
};

export default authService;