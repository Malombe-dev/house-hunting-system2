import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Sidebar from '../components/common/Sidebar';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ClockIcon,
  CogIcon,
  UserIcon,
  BellIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const TenantLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const sidebarItems = [
    {
      name: 'Dashboard',
      href: '/tenant/dashboard',
      icon: ChartBarIcon,
      current: location.pathname === '/tenant/dashboard'
    },
    {
      name: 'Rent Payments',
      href: '/tenant/payments',
      icon: CurrencyDollarIcon,
      current: location.pathname === '/tenant/payments',
      badge: user?.hasOverdueRent ? '!' : null // Example overdue indicator
    },
    {
      name: 'Maintenance',
      href: '/tenant/maintenance',
      icon: WrenchScrewdriverIcon,
      current: location.pathname === '/tenant/maintenance'
    },
    {
      name: 'Lease Agreement',
      href: '/tenant/lease',
      icon: DocumentTextIcon,
      current: location.pathname === '/tenant/lease'
    },
    {
      name: 'Payment History',
      href: '/tenant/payment-history',
      icon: ClockIcon,
      current: location.pathname === '/tenant/payment-history'
    }
  ];

  const userMenuItems = [
    {
      name: 'Your Profile',
      href: '/tenant/profile',
      icon: UserIcon
    },
    {
      name: 'Settings',
      href: '/tenant/settings',
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
        title="Tenant Portal"
        roleColor="from-accent-600 to-accent-700"
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
                className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500"
                onClick={() => setIsSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Page title */}
              <div className="flex-1 min-w-0 lg:hidden">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  Tenant Portal
                </h1>
              </div>

              {/* Right side items */}
              <div className="flex items-center space-x-4">
                {/* Emergency contact button */}
                <div className="hidden md:block">
                  <button className="btn-danger btn-sm">
                    Emergency Contact
                  </button>
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 rounded-full">
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-400 text-center text-xs font-medium leading-4 text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* User info */}
                <div className="hidden lg:flex lg:items-center lg:space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-accent-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.firstName?.charAt(0) || 'T'}
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

export default TenantLayout;