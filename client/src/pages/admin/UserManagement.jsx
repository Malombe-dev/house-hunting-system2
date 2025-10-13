// client/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PowerIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import CreateAgentForm from '../../components/forms/CreateAgentForm';
import userService from '../../services/userService';
import hierarchyService from '../../services/hierarchyService';
import { useNotifications } from '../../context/NotificationContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateAgentModal, setShowCreateAgentModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { showNotification } = useNotifications();

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters = {
        role: roleFilter,
        status: statusFilter,
        search: searchTerm
      };
      
      const response = await userService.getAllUsers(filters);
      
      // Handle different response structures
      const usersData = response.data?.users || response.users || response.data || response;
      
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else if (usersData && Array.isArray(usersData.users)) {
        setUsers(usersData.users);
      } else {
        console.error('Unexpected response format:', response);
        setUsers([]);
      }
      
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Failed to load users', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details with hierarchy
  const fetchUserDetails = async (userId, userRole) => {
    try {
      setLoadingDetails(true);
      
      if (userRole === 'agent' || userRole === 'landlord') {
        const data = await hierarchyService.getAgentDetails(userId);
        setUserDetails(data.data || data);
      } else if (userRole === 'employee') {
        const data = await hierarchyService.getEmployeeStats(userId);
        setUserDetails(data.data || data);
      } else {
        // For other roles, get basic user details
        const data = await userService.getUserDetails(userId);
        setUserDetails(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      showNotification('Failed to load user details', 'error');
      setUserDetails({ user: selectedUser }); // Fallback to basic user info
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    await fetchUserDetails(user._id, user.role);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await userService.deleteUser(userToDelete._id);
      setUsers(prev => prev.filter(user => user._id !== userToDelete._id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      showNotification('User deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification(error.message || 'Failed to delete user', 'error');
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const newStatus = !user.isActive;
      await userService.updateUserStatus(user._id, { isActive: newStatus });
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u._id === user._id ? { ...u, isActive: newStatus } : u
      ));
      
      // If viewing this user, update the selected user as well
      if (selectedUser && selectedUser._id === user._id) {
        setSelectedUser(prev => ({ ...prev, isActive: newStatus }));
      }
      
      showNotification(
        `User ${newStatus ? 'activated' : 'deactivated'} successfully`, 
        'success'
      );
    } catch (error) {
      console.error('Error updating user status:', error);
      showNotification('Failed to update user status', 'error');
    }
  };

  const handleCreateAgent = () => {
    setShowCreateAgentModal(true);
  };

  const handleAgentCreated = (newAgent) => {
    setUsers(prev => [newAgent, ...prev]);
    setShowCreateAgentModal(false);
    showNotification('Agent created successfully!', 'success');
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  // Filter users (client-side additional filtering if needed)
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      agent: 'bg-blue-100 text-blue-800 border-blue-200',
      landlord: 'bg-green-100 text-green-800 border-green-200',
      employee: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      tenant: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      seeker: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[role] || colors.seeker;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all platform users and their permissions</p>
        </div>
        <button onClick={handleCreateAgent} className="btn-primary flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Agent/Landlord
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard
          title="Agents"
          value={users.filter(u => u.role === 'agent').length}
          icon={BriefcaseIcon}
          color="blue"
        />
        <StatCard
          title="Landlords"
          value={users.filter(u => u.role === 'landlord').length}
          icon={BriefcaseIcon}
          color="green"
        />
        <StatCard
          title="Employees"
          value={users.filter(u => u.role === 'employee').length}
          icon={UserGroupIcon}
          color="cyan"
        />
        <StatCard
          title="Tenants"
          value={users.filter(u => u.role === 'tenant').length}
          icon={UserGroupIcon}
          color="yellow"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
                <option value="landlord">Landlord</option>
                <option value="employee">Employee</option>
                <option value="tenant">Tenant</option>
                <option value="seeker">Seeker</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-medium text-gray-700">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-gray-400">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <UserActions 
                        user={user}
                        onView={handleViewUser}
                        onDelete={handleDeleteUser}
                        onToggleStatus={toggleUserStatus}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <UserGroupIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No users found</p>
                      <p className="text-gray-600">
                        {searchTerm || roleFilter || statusFilter 
                          ? 'Try adjusting your search or filters' 
                          : 'No users have been created yet'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Agent Modal */}
      <Modal
        isOpen={showCreateAgentModal}
        onClose={() => setShowCreateAgentModal(false)}
        title="Create Agent/Landlord Account"
        size="lg"
      >
        <CreateAgentForm
          onSuccess={handleAgentCreated}
          onCancel={() => setShowCreateAgentModal(false)}
        />
      </Modal>

      {/* User Detail Modal with Hierarchy */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setUserDetails(null);
        }}
        title="User Details & Hierarchy"
        size="xl"
      >
        {loadingDetails ? (
          <div className="py-12 text-center">
            <LoadingSpinner text="Loading details..." />
          </div>
        ) : userDetails ? (
          <UserDetailsWithHierarchy details={userDetails} user={selectedUser} />
        ) : (
          <div className="py-12 text-center text-gray-500">
            Failed to load user details
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}? This action cannot be undone.`}
        variant="danger"
      />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    cyan: 'bg-cyan-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// User Actions Component
const UserActions = ({ user, onView, onDelete, onToggleStatus }) => (
  <div className="flex justify-end space-x-2">
    <button
      onClick={() => onToggleStatus(user)}
      className={`p-2 rounded-lg transition-colors ${
        user.isActive 
          ? 'text-green-600 hover:text-green-900 hover:bg-green-50' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
      title={user.isActive ? 'Deactivate User' : 'Activate User'}
    >
      <PowerIcon className="h-4 w-4" />
    </button>
    <button
      onClick={() => onView(user)}
      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
      title="View Details"
    >
      <EyeIcon className="h-4 w-4" />
    </button>
    <button
      onClick={() => onDelete(user)}
      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
      title="Delete User"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  </div>
);

// User Details with Hierarchy Component
const UserDetailsWithHierarchy = ({ details, user }) => {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'KES 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Safely access nested properties
  const stats = details?.stats || {};
  const employees = details?.employees || [];
  const tenants = details?.tenants || [];
  const parentAgent = details?.parentAgent || null;
  const recentActivity = details?.recentActivity || {};

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-600">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500 capitalize">Role: {user.role}</p>
          <p className="text-sm text-gray-500">
            Status: <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Phone</p>
          <p className="text-base font-medium text-gray-900">{user.phone || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Email Verified</p>
          <p className="text-base font-medium text-gray-900">
            {user.verified ? '✓ Yes' : '✗ No'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Member Since</p>
          <p className="text-base font-medium text-gray-900">{formatDate(user.createdAt)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Last Login</p>
          <p className="text-base font-medium text-gray-900">{formatDate(user.lastLogin)}</p>
        </div>
      </div>

      {/* Agent/Landlord Hierarchy */}
      {(user.role === 'agent' || user.role === 'landlord') && (
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Team & Statistics</h4>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.totalEmployees || 0}</p>
              <p className="text-sm text-gray-600">Employees</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.totalProperties || 0}</p>
              <p className="text-sm text-gray-600">Properties</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.totalTenants || 0}</p>
              <p className="text-sm text-gray-600">Tenants</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{stats.occupancyRate || 0}%</p>
              <p className="text-sm text-gray-600">Occupancy</p>
            </div>
          </div>

          {/* Expected Rent */}
          {stats.totalRentExpected && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Total Expected Rent</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRentExpected)}
              </p>
            </div>
          )}

          {/* Employees List */}
          {employees.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Employees ({employees.length})</h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {employees.map((emp) => (
                  <div key={emp._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {emp.jobTitle} {emp.branch && `• ${emp.branch}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {emp.tenantsCreated || 0} tenants
                      </p>
                      <p className="text-xs text-gray-500">
                        {emp.paymentsRecorded || 0} payments
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Tenants */}
          {tenants.length > 0 && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3">Recent Tenants</h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tenants.map((tenant) => (
                  <div key={tenant._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {tenant.user?.firstName} {tenant.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{tenant.property?.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(tenant.rentAmount)}/month
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tenant.status || 'unknown'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Employee Stats */}
      {user.role === 'employee' && (
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Performance Statistics</h4>
          
          {/* Parent Agent Info */}
          {parentAgent && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Reports To</p>
              <p className="text-base font-semibold text-gray-900">
                {parentAgent.firstName} {parentAgent.lastName}
              </p>
              <p className="text-sm text-gray-500 capitalize">{parentAgent.role}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.tenantsCreated || 0}</p>
              <p className="text-sm text-gray-600">Tenants Created</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.paymentsRecorded || 0}</p>
              <p className="text-sm text-gray-600">Payments Recorded</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats.totalPaymentsAmount)}
              </p>
              <p className="text-sm text-gray-600">Total Amount</p>
            </div>
          </div>

          {/* Performance Score */}
          {stats.performanceScore !== undefined && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-2">Performance Score</p>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${stats.performanceScore}%` }}
                    />
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {stats.performanceScore}%
                </span>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {recentActivity.tenants?.length > 0 && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-2">Recent Tenants</h5>
              <div className="space-y-2">
                {recentActivity.tenants.slice(0, 3).map((tenant) => (
                  <div key={tenant._id} className="p-2 bg-gray-50 rounded text-sm">
                    <span className="font-medium">
                      {tenant.user?.firstName} {tenant.user?.lastName}
                    </span>
                    <span className="text-gray-500"> at </span>
                    <span className="text-gray-700">{tenant.property?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Basic User Info for Other Roles */}
      {!['agent', 'landlord', 'employee'].includes(user.role) && (
        <div className="border-t pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-base font-medium text-gray-900">{user.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`text-base font-medium ${user.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email Verified</p>
              <p className="text-base font-medium text-gray-900">
                {user.verified ? '✓ Yes' : '✗ No'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-base font-medium text-gray-900">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;