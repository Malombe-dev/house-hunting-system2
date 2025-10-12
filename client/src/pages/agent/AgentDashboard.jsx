// client/src/pages/agent/AgentDashboard.jsx (UPDATED WITH EMPLOYEES)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import CreateEmployeeForm from '../../components/forms/CreateEmployeeForm';
import api from '../../services/api';

import { 
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  EyeIcon,
  ExclamationCircleIcon,
  BriefcaseIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AgentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch agent's hierarchy and stats
      const [hierarchyRes, employeesRes] = await Promise.all([
        api.get(`/hierarchy/agent/${user.id}`),
        api.get('/users/my-employees')
      ]);

      setStats({
        totalProperties: hierarchyRes.data.stats.totalProperties,
        activeTenants: hierarchyRes.data.stats.totalTenants,
        totalEmployees: hierarchyRes.data.employees.length,
        monthlyIncome: 1250000, // From payments
        maintenanceRequests: 7,
        propertyGrowth: 15.2,
        tenantGrowth: 8.5,
        incomeGrowth: 22.1,
        maintenanceIncrease: -12.3,
        occupancyRate: hierarchyRes.data.stats.occupancyRate || 85,
        averageRent: 52000
      });

      setEmployees(employeesRes.data.employees || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeCreated = (newEmployee) => {
    setEmployees(prev => [newEmployee, ...prev]);
    setStats(prev => ({
      ...prev,
      totalEmployees: (prev.totalEmployees || 0) + 1
    }));
    setShowCreateEmployeeModal(false);
  };

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
      type: 'employee_action',
      employee: 'Mary Johnson',
      action: 'created new tenant',
      tenant: 'Mike Wilson',
      property: 'Kilimani Studio 3A',
      time: '1 day ago',
      status: 'completed'
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
          <p className="text-sm text-gray-500 mt-1">
            Account ID: {user?.id?.slice(-8).toUpperCase()}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowCreateEmployeeModal(true)}
            className="btn-secondary"
          >
            <UsersIcon className="h-4 w-4 mr-2" />
            Add Employee
          </button>
          <Link to="/agent/properties/new" className="btn-primary">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Properties */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalProperties || 0}
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
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => setShowEmployeesModal(true)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalEmployees || 0}
              </p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <BriefcaseIcon className="h-6 w-6 text-cyan-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-sm text-cyan-600 font-medium">
              View team →
            </span>
          </div>
        </div>

        {/* Active Tenants */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tenants</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.activeTenants || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-sm text-gray-500">
              {stats?.occupancyRate}% occupied
            </span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Income</p>
              <p className="text-3xl font-bold text-gray-900">
                KES {((stats?.monthlyIncome || 0) / 1000000).toFixed(1)}M
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
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.maintenanceRequests || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <WrenchScrewdriverIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-sm text-gray-500">
              Pending requests
            </span>
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

      {/* Bottom Row - Recent Activity */}
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
                activity.type === 'employee_action' ? 'bg-cyan-100' :
                'bg-red-100'
              }`}>
                {activity.type === 'payment_received' && 
                  <CurrencyDollarIcon className="h-4 w-4 text-green-600" />}
                {activity.type === 'maintenance_request' && 
                  <WrenchScrewdriverIcon className="h-4 w-4 text-yellow-600" />}
                {activity.type === 'employee_action' && 
                  <BriefcaseIcon className="h-4 w-4 text-cyan-600" />}
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
                  {activity.type === 'employee_action' && (
                    <>
                      <span className="font-medium">{activity.employee}</span> {activity.action}{' '}
                      <span className="font-medium">{activity.tenant}</span> for{' '}
                      <span className="font-medium">{activity.property}</span>
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

      {/* Create Employee Modal */}
      <Modal
        isOpen={showCreateEmployeeModal}
        onClose={() => setShowCreateEmployeeModal(false)}
        title="Add Team Member"
        size="lg"
      >
        <CreateEmployeeForm
          onSuccess={handleEmployeeCreated}
          onCancel={() => setShowCreateEmployeeModal(false)}
        />
      </Modal>

      {/* View Employees Modal */}
      <Modal
        isOpen={showEmployeesModal}
        onClose={() => setShowEmployeesModal(false)}
        title="Your Team"
        size="lg"
      >
        <div className="space-y-4">
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No team members yet</p>
              <button
                onClick={() => {
                  setShowEmployeesModal(false);
                  setShowCreateEmployeeModal(true);
                }}
                className="btn-primary"
              >
                Add First Employee
              </button>
            </div>
          ) : (
            <>
              {employees.map((employee) => (
                <div key={employee._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{employee.jobTitle}</p>
                      <p className="text-xs text-gray-500">{employee.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{employee.branch || 'Main Office'}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      employee.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AgentDashboard;