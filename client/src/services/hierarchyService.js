// client/src/services/hierarchyService.js
import api from './api';

/**
 * Hierarchy Service
 * Handles all hierarchy-related API calls for agents and employees
 */

const hierarchyService = {
  // Get complete agent hierarchy (Admin only)
  getAgentHierarchy: async () => {
    try {
      const response = await api.get('/hierarchy/agents');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get specific agent details with team
  getAgentDetails: async (agentId) => {
    try {
      const response = await api.get(`/hierarchy/agent/${agentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get employee statistics
  getEmployeeStats: async (employeeId) => {
    try {
      const response = await api.get(`/hierarchy/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get billing summary for all agents (Admin only)
  getBillingSummary: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/hierarchy/billing?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default hierarchyService;