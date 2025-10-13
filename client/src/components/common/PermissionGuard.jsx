// client/src/components/common/PermissionGuard.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

/**
 * Component to guard routes based on permissions
 * @param {string} requiredPermission - The permission key required to access this route
 * @param {React.ReactNode} children - The component to render if permission is granted
 * @param {string} redirectTo - Where to redirect if permission is denied (default: /employee/dashboard)
 * @param {boolean} showAccessDenied - Whether to show access denied message or redirect
 */
const PermissionGuard = ({ 
  requiredPermission, 
  children, 
  redirectTo = '/employee/dashboard',
  showAccessDenied = true 
}) => {
  const { hasPermission, isAdmin, isAgent, user } = usePermissions();

  // Admins and agents bypass all permission checks
  if (isAdmin || isAgent) {
    return <>{children}</>;
  }

  // Check if user has the required permission
  const hasAccess = hasPermission(requiredPermission);

  if (!hasAccess) {
    // Show access denied page
    if (showAccessDenied) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-8">
            <ShieldExclamationIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this feature.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                <strong>Required Permission:</strong> {getPermissionLabel(requiredPermission)}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Contact your supervisor to request access to this feature.
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    // Or redirect to specified page
    return <Navigate to={redirectTo} replace />;
  }

  // User has permission, render the protected content
  return <>{children}</>;
};

// Helper function to get permission label
const getPermissionLabel = (permissionKey) => {
  const labels = {
    canCreateTenants: 'Tenant Management',
    canManageProperties: 'Property Management',
    canHandlePayments: 'Payment Handling',
    canViewReports: 'Report Viewing'
  };
  return labels[permissionKey] || permissionKey;
};

export default PermissionGuard;