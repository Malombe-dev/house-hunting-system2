// client/src/pages/admin/UserManagement.jsx (UPDATED WITH HIERARCHY)
import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import CreateAgentForm from '../../components/forms/CreateAgentForm';
import api from '../../services/api';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users', {
        params: {
          role: roleFilter,
          status: statusFilter,
          search: searchTerm
        }
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details with hierarchy
  const fetchUserDetails = async (userId, userRole) => {
    try {
      setLoadingDetails(true);
      
      if (userRole === 'agent' || userRole === 'landlord') {
        // Fetch agent hierarchy
        const response = await api.get(`/hierarchy/agent/${userId}`);
        setUserDetails(response.data);
      } else if (userRole === 'employee') {
        // Fetch employee stats
        const response = await api.get(`/hierarchy/employee/${userId}`);
        setUserDetails(response.data);
      } else {
        // For other roles, just show basic info
        setUserDetails({ user: selectedUser });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
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
      await api.delete(`/users/${userToDelete._id}`);
      setUsers(prev => prev.filter(user => user._id !== userToDelete._id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleCreateAgent = () => {
    setShowCreateAgentModal(true);
  };

  const handleAgentCreated = (newAgent) => {
    setUsers(prev => [newAgent, ...prev]);
    setShowCreateAgentModal(false);
    alert('Agent created successfully!');
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || (user.isActive ? 'active' : 'inactive') === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
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
        <button onClick={handleCreateAgent} className="btn-primary">
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
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
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
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
              {currentUsers.map((user) => (
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
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
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
        ) : null}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}?`}
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
    <div className="bg-white p-6 rounded-xl shadow-sm border">
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

// User Details with Hierarchy Component
const UserDetailsWithHierarchy = ({ details, user }) => {
  const formatDate = (date) => new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

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
          <p className="text-sm text-gray-500">Account ID: {user._id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      {/* Agent/Landlord Hierarchy */}
      {(user.role === 'agent' || user.role === 'landlord') && details.employees && (
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Team & Statistics</h4>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{details.stats.totalEmployees}</p>
              <p className="text-sm text-gray-600">Employees</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{details.stats.totalProperties}</p>
              <p className="text-sm text-gray-600">Properties</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{details.stats.totalTenants}</p>
              <p className="text-sm text-gray-600">Tenants</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{details.stats.occupancyRate}%</p>
              <p className="text-sm text-gray-600">Occupancy</p>
            </div>
          </div>

          {/* Employees List */}
          {details.employees.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Employees ({details.employees.length})</h5>
              <div className="space-y-2">
                {details.employees.map((emp) => (
                  <div key={emp._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">{emp.firstName[0]}{emp.lastName[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-500">{emp.jobTitle} • {emp.branch}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {emp.tenantsCreated} tenants
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Tenants */}
          {details.tenants && details.tenants.length > 0 && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3">Recent Tenants</h5>
              <div className="space-y-2">
                {details.tenants.slice(0, 5).map((tenant) => (
                  <div key={tenant._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{tenant.user.firstName} {tenant.user.lastName}</p>
                      <p className="text-xs text-gray-500">{tenant.property.name}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tenant.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Employee Stats */}
      {user.role === 'employee' && details.stats && (
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Performance</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{details.stats.tenantsCreated}</p>
              <p className="text-sm text-gray-600">Tenants Created</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{details.stats.paymentsRecorded}</p>
              <p className="text-sm text-gray-600">Payments Recorded</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                KES {(details.stats.totalPaymentsAmount / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-gray-600">Total Payments</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;