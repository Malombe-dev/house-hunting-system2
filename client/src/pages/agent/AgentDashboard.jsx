import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { 
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  EyeIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AgentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalProperties: 24,
          activeTenants: 18,
          monthlyIncome: 1250000,
          maintenanceRequests: 7,
          propertyGrowth: 15.2,
          tenantGrowth: 8.5,
          incomeGrowth: 22.1,
          maintenanceIncrease: -12.3,
          occupancyRate: 85.5,
          averageRent: 52000
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Mock data for charts
  const incomeData = [
    { month: 'Jan', income: 980000, expenses: 150000 },
    { month: 'Feb', income: 1100000, expenses: 180000 },
    { month: 'Mar', income: 1050000, expenses: 160000 },
    { month: 'Apr', income: 1200000, expenses: 200000 },
    { month: 'May', income: 1150000, expenses: 170000 },
    { month: 'Jun', income: 1250000, expenses: 190000 }
  ];

  const propertyTypeData = [
    { name: 'Apartments', value: 12, color: '#3b82f6' },
    { name: 'Houses', value: 8, color: '#22c55e' },
    { name: 'Studios', value: 3, color: '#f59e0b' },
    { name: 'Commercial', value: 1, color: '#ef4444' }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'payment_received',
      tenant: 'John Doe',
      property: 'Westlands Apartment 2B',
      amount: 45000,
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'maintenance_request',
      tenant: 'Jane Smith',
      property: 'Karen House 5',
      issue: 'Plumbing leak in kitchen',
      time: '4 hours ago',
      status: 'pending'
    },
    {
      id: 3,
      type: 'tenant_application',
      applicant: 'Mike Wilson',
      property: 'Kilimani Studio 3A',
      time: '1 day ago',
      status: 'pending'
    },
    {
      id: 4,
      type: 'payment_overdue',
      tenant: 'Sarah Johnson',
      property: 'Lavington Apartment 7C',
      amount: 65000,
      days: 3,
      time: '2 days ago',
      status: 'overdue'
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      type: 'lease_renewal',
      tenant: 'Robert Brown',
      property: 'Runda House 2',
      dueDate: '2024-02-15',
      priority: 'high'
    },
    {
      id: 2,
      type: 'property_inspection',
      property: 'Westlands Apartment 4A',
      dueDate: '2024-02-10',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'maintenance_follow_up',
      property: 'Karen House 3',
      issue: 'AC repair',
      dueDate: '2024-02-08',
      priority: 'high'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your properties today.
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Link to="/agent/properties/new" className="btn-primary">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Properties */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalProperties}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <HomeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">
              +{stats?.propertyGrowth}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last month</span>
          </div>
        </div>

        {/* Active Tenants */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tenants</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.activeTenants}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">
              +{stats?.tenantGrowth}%
            </span>
            <span className="text-sm text-gray-500 ml-2">occupancy rate: {stats?.occupancyRate}%</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Income</p>
              <p className="text-3xl font-bold text-gray-900">
                KES {(stats?.monthlyIncome / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">
              +{stats?.incomeGrowth}%
            </span>
            <span className="text-sm text-gray-500 ml-2">avg: KES {(stats?.averageRent / 1000).toFixed(0)}K</span>
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance Requests</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.maintenanceRequests}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <WrenchScrewdriverIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowTrendingDownIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">
              {Math.abs(stats?.maintenanceIncrease)}% less
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses</h3>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-secondary-500 focus:border-transparent">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                <Tooltip 
                  formatter={(value, name) => [
                    `KES ${(value / 1000).toFixed(0)}K`, 
                    name === 'income' ? 'Income' : 'Expenses'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stackId="1"
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="1"
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property Types Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Property Portfolio</h3>
            <Link 
              to="/agent/properties" 
              className="text-sm text-secondary-600 hover:text-secondary-800 font-medium flex items-center space-x-1"
            >
              <span>View all</span>
              <EyeIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {propertyTypeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link 
              to="/agent/activity" 
              className="text-sm text-secondary-600 hover:text-secondary-800 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'payment_received' ? 'bg-green-100' :
                  activity.type === 'maintenance_request' ? 'bg-yellow-100' :
                  activity.type === 'tenant_application' ? 'bg-blue-100' :
                  'bg-red-100'
                }`}>
                  {activity.type === 'payment_received' && 
                    <CurrencyDollarIcon className="h-4 w-4 text-green-600" />}
                  {activity.type === 'maintenance_request' && 
                    <WrenchScrewdriverIcon className="h-4 w-4 text-yellow-600" />}
                  {activity.type === 'tenant_application' && 
                    <UserGroupIcon className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'payment_overdue' && 
                    <ExclamationCircleIcon className="h-4 w-4 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {activity.type === 'payment_received' && (
                      <>
                        <span className="font-medium">{activity.tenant}</span> paid 
                        rent for <span className="font-medium">{activity.property}</span>
                      </>
                    )}
                    {activity.type === 'maintenance_request' && (
                      <>
                        <span className="font-medium">{activity.tenant}</span> reported 
                        {activity.issue} at <span className="font-medium">{activity.property}</span>
                      </>
                    )}
                    {activity.type === 'tenant_application' && (
                      <>
                        <span className="font-medium">{activity.applicant}</span> applied 
                        for <span className="font-medium">{activity.property}</span>
                      </>
                    )}
                    {activity.type === 'payment_overdue' && (
                      <>
                        <span className="font-medium">{activity.tenant}</span> payment overdue 
                        for <span className="font-medium">{activity.property}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
            <Link 
              to="/agent/tasks" 
              className="text-sm text-secondary-600 hover:text-secondary-800 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200">
                <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {task.type === 'lease_renewal' && `Lease renewal - ${task.tenant}`}
                    {task.type === 'property_inspection' && `Property inspection`}
                    {task.type === 'maintenance_follow_up' && `Follow up: ${task.issue}`}
                  </p>
                  <p className="text-xs text-gray-600">{task.property}</p>
                  <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;