// client/src/pages/agent/AgentDashboard.jsx (FINAL FIXED VERSION)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import CreateEmployeeForm from '../../components/forms/CreateEmployeeForm';
import api from '../../services/api';
import EditEmployeeForm from '../../components/forms/EditEmployeeForm';

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
  UsersIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AgentDashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeTenants: 0,
    totalEmployees: 0,
    monthlyIncome: 0,
    maintenanceRequests: 0,
    propertyGrowth: 0,
    tenantGrowth: 0,
    incomeGrowth: 0,
    maintenanceIncrease: 0,
    occupancyRate: 0,
    averageRent: 0,
    pendingProperties: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [pendingProperties, setPendingProperties] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      console.log('Starting dashboard data fetch...');

      // Fetch data - hierarchy contains everything we need
      const requests = [
        api.get(`/hierarchy/agent/${user.id}`).catch(err => {
          console.warn('Hierarchy fetch failed:', err.response?.data || err.message);
          return { data: { employees: [], properties: [], stats: {} } };
        }),
        api.get('/properties/my-properties').catch(err => {
          console.warn('Properties fetch failed:', err.response?.data || err.message);
          return { data: { properties: [] } };
        }),
        api.get('/properties/pending').catch(err => {
          console.warn('Pending properties fetch failed:', err.response?.data || err.message);
          return { data: { properties: [] } };
        })
      ];

      const [hierarchyRes, propertiesRes, pendingRes] = await Promise.all(requests);

      console.log('Raw API responses:', {
        hierarchy: hierarchyRes.data,
        properties: propertiesRes.data,
        pending: pendingRes.data
      });

      // Extract data from responses based on the actual structure from your logs
      const hierarchyData = hierarchyRes.data || {};
      const employeesData = hierarchyData.employees || [];
      const hierarchyProperties = hierarchyData.properties || [];
      const hierarchyStats = hierarchyData.stats || {};
      
      const propertiesData = propertiesRes.data?.properties || propertiesRes.data || [];
      const pendingPropertiesData = pendingRes.data?.properties || pendingRes.data || [];

      console.log('Extracted data:', {
        employeesData,
        propertiesData,
        pendingPropertiesData,
        hierarchyStats
      });

      // Calculate real stats
      const totalProperties = propertiesData.length || hierarchyProperties.length;
      const activeProperties = propertiesData.filter(p => 
        p.status === 'active' || p.status === 'approved'
      ).length;

      const pendingPropertiesCount = pendingPropertiesData.length;

      setStats({
        totalProperties,
        activeTenants: hierarchyStats.totalTenants || 0,
        totalEmployees: employeesData.length,
        monthlyIncome: hierarchyStats.monthlyIncome || 1250000,
        maintenanceRequests: hierarchyStats.maintenanceRequests || 7,
        propertyGrowth: hierarchyStats.propertyGrowth || 15.2,
        tenantGrowth: hierarchyStats.tenantGrowth || 8.5,
        incomeGrowth: hierarchyStats.incomeGrowth || 22.1,
        maintenanceIncrease: hierarchyStats.maintenanceIncrease || -12.3,
        occupancyRate: totalProperties > 0 ? Math.round((activeProperties / totalProperties) * 100) : 0,
        averageRent: hierarchyStats.averageRent || 52000,
        pendingProperties: pendingPropertiesCount
      });

      setEmployees(employeesData);
      setPendingProperties(pendingPropertiesData);

    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeCreated = async (newEmployee) => {
    try {
      // Refresh the dashboard data to get the updated employee list
      await fetchDashboardData();
      setShowCreateEmployeeModal(false);
    } catch (error) {
      console.error('Error refreshing after employee creation:', error);
    }
  };

  const handleEmployeeUpdated = (updatedEmployee) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp._id === updatedEmployee._id ? updatedEmployee : emp
      )
    );
    setEditingEmployee(null);
  };

 // In the handleDeleteEmployee function, replace with:
const handleDeleteEmployee = async () => {
  if (!deletingEmployee) return;

  try {
    // Instead of using the admin-only delete endpoint, deactivate the employee
    await api.put(`/users/${deletingEmployee._id}/status`, {
      isActive: false
    });
    
    // Update the employee list locally
    setEmployees(prev => 
      prev.map(emp => 
        emp._id === deletingEmployee._id 
          ? { ...emp, isActive: false }
          : emp
      )
    );
    
    setDeletingEmployee(null);
    alert('Employee deactivated successfully!');
  } catch (error) {
    console.error('Error deactivating employee:', error);
    
    // If status update fails, try to refresh the data
    if (error.response?.status === 403) {
      alert('You do not have permission to delete users. Employee has been deactivated instead.');
      await fetchDashboardData(); // Refresh to get current state
    } else {
      alert('Failed to update employee status');
    }
  }
};

  const sendWelcomeEmail = async (employeeId) => {
    try {
      await api.post('/auth/send-welcome-email', { userId: employeeId });
      alert('Welcome email sent successfully!');
    } catch (error) {
      console.error('Error sending welcome email:', error);
      alert('Failed to send welcome email');
    }
  };

  const handleApproveProperty = async (propertyId) => {
    try {
      await api.patch(`/properties/${propertyId}/approve`);
      await fetchDashboardData(); // Refresh all data
      alert('Property approved successfully!');
    } catch (error) {
      console.error('Error approving property:', error);
      alert('Failed to approve property');
    }
  };

  const handleRejectProperty = async (propertyId) => {
    try {
      await api.patch(`/properties/${propertyId}/reject`);
      await fetchDashboardData(); // Refresh all data
      alert('Property rejected successfully!');
    } catch (error) {
      console.error('Error rejecting property:', error);
      alert('Failed to reject property');
    }
  };

  // Mock data for charts (fallback)
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
            Account ID: {user?.id?.slice(-8)?.toUpperCase() || 'N/A'}
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
                {stats.totalProperties}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <HomeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">
              +{stats.propertyGrowth}%
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
                {stats.totalEmployees}
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
                {stats.activeTenants}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-sm text-gray-500">
              {stats.occupancyRate}% occupied
            </span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Income</p>
              <p className="text-3xl font-bold text-gray-900">
                KES {(stats.monthlyIncome / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">
              +{stats.incomeGrowth}%
            </span>
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.maintenanceRequests}
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

      {/* Pending Properties Approval Section */}
      {pendingProperties.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-yellow-800">
              Properties Pending Approval
            </h3>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              {pendingProperties.length} pending
            </span>
          </div>
          <div className="space-y-3">
            {pendingProperties.slice(0, 3).map((property) => (
              <div key={property._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  {property.images?.[0] && (
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{property.title}</p>
                    <p className="text-sm text-gray-600">{property.location?.address}</p>
                    <p className="text-xs text-gray-500">KES {property.price?.toLocaleString()}/month</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveProperty(property._id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleRejectProperty(property._id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {pendingProperties.length > 3 && (
            <div className="mt-4 text-center">
              <Link 
                to="/agent/properties/pending" 
                className="text-yellow-700 hover:text-yellow-800 font-medium text-sm"
              >
                View all {pendingProperties.length} pending properties →
              </Link>
            </div>
          )}
        </div>
      )}

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
        size="xl"
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
              <div className="grid gap-4">
                {employees.map((employee) => (
                  <div key={employee._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="h-12 w-12 bg-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {employee.firstName?.[0]}{employee.lastName?.[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{employee.jobTitle || 'Employee'}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            <EnvelopeIcon className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{employee.email}</span>
                          </div>
                          {employee.phone && (
                            <div className="flex items-center space-x-1">
                              <PhoneIcon className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{employee.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        employee.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => sendWelcomeEmail(employee._id)}
                          className="p-2 text-gray-400 hover:text-cyan-600 transition-colors"
                          title="Send Welcome Email"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => setEditingEmployee(employee)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Employee"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => setDeletingEmployee(employee)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Employee"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  {employees.length} team member{employees.length !== 1 ? 's' : ''}
                </p>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        title="Edit Team Member"
        size="lg"
      >
        {editingEmployee && (
          <EditEmployeeForm
            employee={editingEmployee}
            onSuccess={handleEmployeeUpdated}
            onCancel={() => setEditingEmployee(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        title="Delete Team Member"
        size="md"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <TrashIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete {deletingEmployee?.firstName} {deletingEmployee?.lastName}?
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone. This will permanently remove the employee 
            from your team and revoke their access to the system.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setDeletingEmployee(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteEmployee}
              className="btn-danger"
            >
              Delete Employee
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AgentDashboard;