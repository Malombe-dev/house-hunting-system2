import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login';
          }
          toast.error('Session expired. Please login again.');
          break;
        
        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action.');
          break;
        
        case 404:
          // Not found
          toast.error('Requested resource not found.');
          break;
        
        case 422:
          // Validation errors
          if (response.data.errors) {
            response.data.errors.forEach(err => {
              toast.error(err.message || err.msg);
            });
          } else {
            toast.error(response.data.message || 'Validation error occurred.');
          }
          break;
        
        case 429:
          // Rate limit exceeded
          toast.error('Too many requests. Please try again later.');
          break;
        
        case 500:
          // Server error
          toast.error('Internal server error. Please try again later.');
          break;
        
        default:
          // Other errors
          const message = response.data?.message || 'An error occurred';
          toast.error(message);
      }
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      toast.error('Request timeout. Please check your connection.');
    } else if (error.message === 'Network Error') {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other errors
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// API helper methods
export const apiMethods = {
  // GET request
  get: (url, config = {}) => api.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => api.delete(url, config),
  
  // Upload file
  upload: (url, formData, config = {}) => {
    return api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers
      }
    });
  },
  
  // Download file
  download: (url, config = {}) => {
    return api.get(url, {
      ...config,
      responseType: 'blob'
    });
  }
};

// Utility functions
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value instanceof FileList) {
      // Handle FileList
      Array.from(value).forEach(file => {
        formData.append(key, file);
      });
    } else if (Array.isArray(value)) {
      // Handle arrays
      value.forEach((item, index) => {
        if (typeof item === 'object' && !(item instanceof File)) {
          formData.append(`${key}[${index}]`, JSON.stringify(item));
        } else {
          formData.append(`${key}[${index}]`, item);
        }
      });
    } else if (typeof value === 'object' && value !== null && !(value instanceof File)) {
      // Handle objects
      formData.append(key, JSON.stringify(value));
    } else if (value !== null && value !== undefined) {
      // Handle primitives and files
      formData.append(key, value);
    }
  });
  
  return formData;
};

export default api;