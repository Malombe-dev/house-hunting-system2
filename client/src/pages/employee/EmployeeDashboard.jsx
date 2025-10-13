// client/src/pages/employee/EmployeeDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';


const EmployeeDashboard = () => {
  // keep your logic intact
  const {
    canCreateTenants,
    canManageProperties,
    canHandlePayments,
    canViewReports,
    accessibleFeatures,
    user
  } = usePermissions();

  // Placeholder stats object — replace with real API data when ready
  const stats = {}; // e.g. { tenants: 12, payments: 45, properties: 8 }

  // Quick action cards (permission-driven) - logic unchanged
  const quickActions = [
    {
      name: 'Add New Tenant',
      description: 'Create and onboard new tenants',
      href: '/employee/create-tenant',
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      show: canCreateTenants
    },
    {
      name: 'View Properties',
      description: 'Browse and manage properties',
      href: '/employee/properties',
      icon: BuildingOfficeIcon,
      color: 'bg-green-500',
      show: canManageProperties
    },
    {
      name: 'Record Payment',
      description: 'Record rent and other payments',
      href: '/employee/payments/new',
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
      show: canHandlePayments
    },
    {
      name: 'View Reports',
      description: 'Access financial reports and analytics',
      href: '/employee/reports',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      show: canViewReports
    }
  ].filter(action => action.show);

  // Recent activity (mock data, still filtered by permissions)
  const recentActivity = [
    {
      id: 1,
      action: 'Created tenant',
      detail: 'John Doe - Apartment 5B',
      time: '2 hours ago',
      show: canCreateTenants
    },
    {
      id: 2,
      action: 'Recorded payment',
      detail: 'KES 25,000 - Jane Smith',
      time: '5 hours ago',
      show: canHandlePayments
    },
    {
      id: 3,
      action: 'Updated property',
      detail: 'Westlands Apartment - Unit 3A',
      time: '1 day ago',
      show: canManageProperties
    }
  ].filter(activity => activity.show);

  // initials avatar (Option 2)
  const initials = (user?.firstName || '').charAt(0).toUpperCase() +
                   (user?.lastName || '').charAt(0).toUpperCase();

  // placeholder values (show -- if not provided)
  const tenantsCount = stats.tenants || '--';
  const paymentsCount = stats.payments || '--';
  const propertiesCount = stats.properties || '--';

  return (
    <div className="space-y-8">
      {/* Header with Avatar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
            {initials || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-sm text-gray-600">
              Employee Dashboard — quick overview of your tasks and access
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Role</p>
          <p className="text-sm font-medium text-gray-900">Employee</p>
        </div>
      </div>

      {/* Permissions Summary (keeps original cards but slightly upgraded) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Access Permissions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PermissionCard
            title="Tenant Management"
            granted={canCreateTenants}
            description="Create & manage tenants"
          />
          <PermissionCard
            title="Property Management"
            granted={canManageProperties}
            description="View & edit properties"
          />
          <PermissionCard
            title="Payment Handling"
            granted={canHandlePayments}
            description="Record payments"
          />
          <PermissionCard
            title="Report Viewing"
            granted={canViewReports}
            description="Access analytics"
          />
        </div>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-transform transform hover:-translate-y-1"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{action.name}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                    <div className="self-center">
                      <svg className="h-5 w-5 text-gray-300 group-hover:text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {canCreateTenants && (
          <StatCard
            title="Tenants Created"
            value={tenantsCount}
            subtitle="This month"
            icon={UserGroupIcon}
            color="blue"
          />
        )}
        {canHandlePayments && (
          <StatCard
            title="Payments Recorded"
            value={paymentsCount}
            subtitle="This month"
            icon={CurrencyDollarIcon}
            color="green"
          />
        )}
        {canManageProperties && (
          <StatCard
            title="Properties Managed"
            value={propertiesCount}
            subtitle="Active listings"
            icon={BuildingOfficeIcon}
            color="purple"
          />
        )}
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link to="/employee/activity" className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center space-x-1">
              <span>View all</span>
              <EyeIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Permissions Message (keeps original behavior) */}
      {accessibleFeatures.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <svg className="h-16 w-16 text-yellow-500 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Permissions Assigned</h3>
          <p className="text-gray-600 mb-4">You don't have any permissions assigned yet. Please contact your supervisor.</p>
        </div>
      )}
    </div>
  );
};

/* ---------------------------
   Small UI helper components
   (keeps logic intact — purely presentational)
   --------------------------- */

const PermissionCard = ({ title, granted, description }) => {
  return (
    <div className={`p-4 rounded-lg border-2 ${granted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {granted ? (
          <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      <p className="text-xs text-gray-600">{description}</p>
      <div className="mt-2">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${granted ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
          {granted ? 'Granted' : 'Not Granted'}
        </span>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colors[color]} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{subtitle}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <h3 className="text-sm text-gray-600">{title}</h3>
    </div>
  );
};

export default EmployeeDashboard;
