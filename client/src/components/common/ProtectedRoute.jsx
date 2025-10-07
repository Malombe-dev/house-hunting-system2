import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/auth/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = getRoleBasedRedirect(user?.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Helper function to get role-based redirect path
const getRoleBasedRedirect = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'agent':
    case 'landlord':
      return '/agent/dashboard';
    case 'tenant':
      return '/tenant/dashboard';
    case 'seeker':
      return '/';
    default:
      return '/';
  }
};

export default ProtectedRoute;