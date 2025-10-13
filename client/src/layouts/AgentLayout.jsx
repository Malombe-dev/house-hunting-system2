import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Sidebar from '../components/common/Sidebar';
import NotificationsDropdown from '../pages/shared/NotificationsDropdown';
import { 
  ChartBarIcon,
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ChartPieIcon,
  CogIcon,
  UserIcon,
  BellIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const AgentLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const sidebarItems = [
    {
      name: 'Dashboard',
      href: '/agent/dashboard',
      icon: ChartBarIcon,
      current: location.pathname === '/agent/dashboard'
    },
    {
      name: 'Properties',
      href: '/agent/properties',
      icon: HomeIcon,
      current: location.pathname === '/agent/properties'
    },
    {
      name: 'Tenants',
      href: '/agent/tenants',
      icon: UserGroupIcon,
      current: location.pathname === '/agent/tenants'
    },
    {
      name: 'Payments',
      href: '/agent/payments',
      icon: CurrencyDollarIcon,
      current: location.pathname === '/agent/payments',
      badge: 3 // Example overdue payments
    },
    {
      name: 'Maintenance',
      href: '/agent/maintenance',
      icon: WrenchScrewdriverIcon,
      current: location.pathname === '/agent/maintenance',
      badge: 7 // Example pending requests
    },
    {
      name: 'Analytics',
      href: '/agent/analytics',
      icon: ChartPieIcon,
      current: location.pathname === '/agent/analytics'
    }
  ];

  const userMenuItems = [
    {
      name: 'Your Profile',
      href: '/agent/profile',
      icon: UserIcon
    },
    {
      name: 'Settings',
      href: '/agent/settings',
      icon: CogIcon
    }
  ];

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
        title={user?.role === 'landlord' ? 'Landlord Panel' : 'Agent Panel'}
        roleColor="from-secondary-600 to-secondary-700"
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
                className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary-500"
                onClick={() => setIsSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Page title */}
              <div className="flex-1 min-w-0 lg:hidden">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {user?.role === 'landlord' ? 'Landlord Panel' : 'Agent Panel'}
                </h1>
              </div>

              {/* Right side items */}
              <div className="flex items-center space-x-4">
                {/* Quick actions */}
                <div className="hidden md:flex items-center space-x-3">
                  <button className="btn-primary btn-sm">
                    Add Property
                  </button>
                </div>

                {/* 🔔 REPLACE THE OLD NOTIFICATIONS BUTTON WITH NOTIFICATIONSDROPDOWN 🔔 */}
                <NotificationsDropdown />

                {/* User info */}
                <div className="hidden lg:flex lg:items-center lg:space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-secondary-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.firstName?.charAt(0) || 'A'}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate capitalize">
                      {user?.role}
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

export default AgentLayout;