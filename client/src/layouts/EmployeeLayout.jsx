// client/src/layouts/EmployeeLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import Header from '../components/common/Header';

const EmployeeLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Get user permissions (default to empty object if not set)
  const permissions = user?.permissions || {
    canCreateTenants: false,
    canViewReports: false,
    canManageProperties: false,
    canHandlePayments: false
  };

  // Define navigation items based on permissions
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/employee/dashboard',
      icon: HomeIcon,
      show: true // Always show dashboard
    },
    {
      name: 'Tenants',
      href: '/employee/tenants',
      icon: UserGroupIcon,
      show: permissions.canCreateTenants,
      badge: 'Manage'
    },
    {
      name: 'Properties',
      href: '/employee/properties',
      icon: BuildingOfficeIcon,
      show: permissions.canManageProperties,
      badge: 'View/Edit'
    },
    {
      name: 'Payments',
      href: '/employee/payments',
      icon: CurrencyDollarIcon,
      show: permissions.canHandlePayments,
      badge: 'Record'
    },
    {
      name: 'Reports',
      href: '/employee/reports',
      icon: ChartBarIcon,
      show: permissions.canViewReports,
      badge: 'View Only'
    }
  ].filter(item => item.show); // Filter out items user doesn't have access to

  // Check if user has at least one permission
  const hasAnyPermission = Object.values(permissions).some(permission => permission === true);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // If employee has no permissions, show access denied
  if (!hasAnyPermission) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center max-w-md mx-auto p-8">
            <ShieldExclamationIcon className="h-24 w-24 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Permissions Assigned
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have any permissions assigned yet. Please contact your supervisor or administrator to grant you access.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-gray-700 mb-2">Your Account:</p>
              <p className="text-sm text-gray-600">Name: {user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-gray-600">Email: {user?.email}</p>
              <p className="text-sm text-gray-600">Role: Employee</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
            transform transition-transform duration-300 ease-in-out lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            mt-16 lg:mt-0
          `}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-xs text-gray-500">Employee Dashboard</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Permission Badge */}
              <div className="mt-3 p-2 bg-cyan-50 rounded-lg">
                <p className="text-xs font-medium text-cyan-900 mb-1">Your Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {permissions.canCreateTenants && (
                    <span className="text-xs px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded">
                      Tenants
                    </span>
                  )}
                  {permissions.canManageProperties && (
                    <span className="text-xs px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded">
                      Properties
                    </span>
                  )}
                  {permissions.canHandlePayments && (
                    <span className="text-xs px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded">
                      Payments
                    </span>
                  )}
                  {permissions.canViewReports && (
                    <span className="text-xs px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded">
                      Reports
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${active
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer Info */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Access Level: Limited</p>
                <p>Contact your supervisor to request additional permissions.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile menu button */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;