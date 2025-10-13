// client/src/hooks/usePermissions.js
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to check user permissions
 * @returns {Object} Permission checks and user permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();

  // Get permissions from user object
  const permissions = user?.permissions || {
    canCreateTenants: false,
    canViewReports: false,
    canManageProperties: false,
    canHandlePayments: false
  };

  // Check if user is employee
  const isEmployee = user?.role === 'employee';

  // Check if user is agent/landlord (has all permissions)
  const isAgent = user?.role === 'agent' || user?.role === 'landlord';

  // Check if user is admin (has all permissions)
  const isAdmin = user?.role === 'admin';

  /**
   * Check if user has a specific permission
   * Admins and Agents have all permissions by default
   */
  const hasPermission = (permissionKey) => {
    // Admins and agents have all permissions
    if (isAdmin || isAgent) return true;

    // Employees check their specific permissions
    if (isEmployee) {
      return permissions[permissionKey] === true;
    }

    return false;
  };

  /**
   * Check if user can access a specific feature
   */
  const canAccessFeature = (feature) => {
    const featurePermissions = {
      tenants: 'canCreateTenants',
      properties: 'canManageProperties',
      payments: 'canHandlePayments',
      reports: 'canViewReports'
    };

    const permissionKey = featurePermissions[feature];
    return permissionKey ? hasPermission(permissionKey) : false;
  };

  /**
   * Check if user has at least one permission
   */
  const hasAnyPermission = () => {
    if (isAdmin || isAgent) return true;
    return Object.values(permissions).some(permission => permission === true);
  };

  /**
   * Get list of features user can access
   */
  const accessibleFeatures = () => {
    if (isAdmin || isAgent) {
      return ['tenants', 'properties', 'payments', 'reports'];
    }

    const features = [];
    if (permissions.canCreateTenants) features.push('tenants');
    if (permissions.canManageProperties) features.push('properties');
    if (permissions.canHandlePayments) features.push('payments');
    if (permissions.canViewReports) features.push('reports');
    
    return features;
  };

  return {
    // Permission checks
    canCreateTenants: hasPermission('canCreateTenants'),
    canViewReports: hasPermission('canViewReports'),
    canManageProperties: hasPermission('canManageProperties'),
    canHandlePayments: hasPermission('canHandlePayments'),

    // Helper functions
    hasPermission,
    canAccessFeature,
    hasAnyPermission: hasAnyPermission(),
    accessibleFeatures: accessibleFeatures(),

    // User info
    isEmployee,
    isAgent,
    isAdmin,
    permissions,
    user
  };
};

export default usePermissions;