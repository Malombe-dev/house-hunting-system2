// client/src/layouts/EmployeeLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Sidebar from '../components/common/Sidebar';
import { 
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
  BellIcon,
  Bars3Icon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

const EmployeeLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarItems, setSidebarItems] = useState([]);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  // Get user permissions safely
  const permissions = user?.permissions || {
    canCreateTenants: false,
    canViewReports: false,
    canManageProperties: false,
    canHandlePayments: false
  };

  // Build sidebar items whenever permissions or location changes
  useEffect(() => {
    const items = [
      {
        name: 'Dashboard',
        href: '/employee/dashboard',
        icon: HomeIcon,
        current: location.pathname === '/employee/dashboard',
        show: true 
      },
      {
        name: 'Tenant Management',
        href: '/employee/tenants',
        icon: UserGroupIcon,
        current: location.pathname.startsWith('/employee/tenants'),
        show: permissions.canCreateTenants,
        badge: permissions.canCreateTenants ? 'Manage' : null
      },
      {
        name: 'Property Management',
        href: '/employee/properties',
        icon: BuildingOfficeIcon,
        current: location.pathname.startsWith('/employee/properties'),
        show: permissions.canManageProperties,
        badge: permissions.canManageProperties ? 'View/Edit' : null
      },
      {
        name: 'Payment Processing',
        href: '/employee/payments',
        icon: CurrencyDollarIcon,
        current: location.pathname.startsWith('/employee/payments'),
        show: permissions.canHandlePayments,
        badge: permissions.canHandlePayments ? 'Record' : null
      },
      {
        name: 'Reports & Analytics',
        href: '/employee/reports',
        icon: ChartBarIcon,
        current: location.pathname.startsWith('/employee/reports'),
        show: permissions.canViewReports,
        badge: permissions.canViewReports ? 'View Only' : null
      }
    ].filter(item => item.show !== false);

    setSidebarItems(items);
  }, [permissions, location.pathname]);

  const userMenuItems = [
    {
      name: 'Your Profile',
      href: '/employee/profile',
      icon: UserIcon
    },
    {
      name: 'Settings',
      href: '/employee/settings',
      icon: CogIcon
    }
  ];

  // Check if user has at least one permission (excluding dashboard)
  const hasAnyPermission = user?.permissions && Object.values(user.permissions).some(permission => permission === true);

  // Show loading state while checking permissions
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If employee has no permissions, show access denied
  if (!hasAnyPermission) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-primary-600">RentalManager</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Employee Portal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Access denied content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <ShieldExclamationIcon className="mx-auto h-24 w-24 text-red-500" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Access Restricted
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                You don't have any permissions assigned to access the employee portal.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Account Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{user?.firstName} {user?.lastName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="text-sm text-gray-900 capitalize">Employee</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Branch</dt>
                  <dd className="text-sm text-gray-900">{user?.branch || 'Not assigned'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Job Title</dt>
                  <dd className="text-sm text-gray-900">{user?.jobTitle || 'Not specified'}</dd>
                </div>
              </dl>
              <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-700">
                  Please contact your supervisor or system administrator to request access permissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        userMenuItems={userMenuItems}
        user={user}
        onLogout={logout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title="Employee Portal"
        roleColor="from-primary-500 to-primary-600"
        // Add permissions info to sidebar
        additionalInfo={
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-900 mb-2">Your Permissions:</p>
            <div className="flex flex-wrap gap-1">
              {permissions.canCreateTenants && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  Tenants
                </span>
              )}
              {permissions.canManageProperties && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Properties
                </span>
              )}
              {permissions.canHandlePayments && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Payments
                </span>
              )}
              {permissions.canViewReports && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                  Reports
                </span>
              )}
            </div>
          </div>
        }
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setIsSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Page title */}
              <div className="flex-1 min-w-0 lg:hidden">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  Employee Portal
                </h1>
              </div>

              {/* Right side items */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Link
                  to="/employee/notifications"
                  className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-400 text-center text-xs font-medium leading-4 text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User info - hidden on mobile, shown in sidebar */}
                <div className="hidden lg:flex lg:items-center lg:space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.firstName?.charAt(0) || 'E'}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.jobTitle || 'Employee'} • {user?.branch || 'Main Branch'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;