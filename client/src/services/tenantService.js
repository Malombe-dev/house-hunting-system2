// client/src/services/tenantService.js
import { apiMethods } from './api';

const tenantService = {
  /**
   * Get all tenants (filtered by user role on backend)
   */
  getAllTenants: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.property) params.append('property', filters.property);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await apiMethods.get(`/tenants?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get tenant by ID
   */
  getTenantById: async (tenantId) => {
    try {
      const response = await apiMethods.get(`/tenants/${tenantId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new tenant (with or without existing user account)
   */
  createTenant: async (tenantData) => {
    try {
      const response = await apiMethods.post('/tenants', tenantData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update tenant information
   */
  updateTenant: async (tenantId, updateData) => {
    try {
      const response = await apiMethods.put(`/tenants/${tenantId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete tenant
   */
  deleteTenant: async (tenantId) => {
    try {
      const response = await apiMethods.delete(`/tenants/${tenantId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get tenant statistics
   */
  getTenantStats: async () => {
    try {
      const response = await apiMethods.get('/tenants/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Convert seeker to tenant
   */
  convertSeekerToTenant: async (userId) => {
    try {
      const response = await apiMethods.post('/tenants/convert-seeker', { userId });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search for seekers (to convert to tenants)
   */
  searchSeekers: async (searchTerm) => {
    try {
      const response = await apiMethods.get(`/users?role=seeker&search=${searchTerm}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default tenantService;