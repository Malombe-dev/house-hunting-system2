// client/src/pages/AGENT/TenantManagement.jsx (FIXED VERSION)
import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import tenantService from '../../services/tenantService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import CreateTenantForm from '../../components/forms/CreateTenantForm';
import TenantDetailsModal from '../../components/modals/TenantDetailsModal';
import toast from 'react-hot-toast';

const TenantManagement = () => {
  const { user } = useAuth();
  const { canCreateTenants, isAgent } = usePermissions();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, terminated: 0 });
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTenants, setTotalTenants] = useState(0);
  const tenantsPerPage = 10;
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);

  // Determine if user can access tenant management
  const hasAccess = isAgent || canCreateTenants;

  useEffect(() => {
    if (hasAccess) {
      fetchTenants();
      fetchStats();
    }
  }, [hasAccess, currentPage, statusFilter]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await tenantService.getAllTenants({
        status: statusFilter,
        search: searchTerm,
        page: currentPage,
        limit: tenantsPerPage
      });

      console.log('Tenants API Response:', response);

      if (response.success) {
        setTenants(response.tenants || []);
        setTotalPages(response.pagination?.pages || 1);
        setTotalTenants(response.pagination?.total || 0);
        
        // Debug logs
        console.log('Tenants array:', response.tenants);
        if (response.tenants && response.tenants.length > 0) {
          console.log('First tenant property data:', response.tenants[0].property);
        }
      } else {
        console.error('API returned success: false', response);
        toast.error(response.message || 'Failed to load tenants');
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error(error.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await tenantService.getTenantStats();
      console.log('Stats API Response:', response);
      
      if (response.success) {
        setStats(response.stats || calculateStatsFromTenants());
      } else {
        console.error('Stats API returned success: false', response);
        setStats(calculateStatsFromTenants());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(calculateStatsFromTenants());
    } finally {
      setStatsLoading(false);
    }
  };

  const calculateStatsFromTenants = () => {
    return {
      total: tenants.length,
      active: tenants.filter(t => t.status === 'active').length,
      inactive: tenants.filter(t => t.status === 'inactive').length,
      terminated: tenants.filter(t => t.status === 'terminated').length
    };
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTenants();
  };

  const handleCreateTenant = () => {
    setShowCreateModal(true);
  };

  const handleTenantCreated = (newTenant) => {
    setTenants(prev => [newTenant, ...prev]);
    setShowCreateModal(false);
    fetchStats();
    fetchTenants();
    toast.success('Tenant created successfully!');
  };

  const handleViewTenant = (tenant) => {
    setSelectedTenant(tenant);
    setShowDetailsModal(true);
  };

  const handleDeleteTenant = (tenant) => {
    setTenantToDelete(tenant);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await tenantService.deleteTenant(tenantToDelete._id);
      if (response.success) {
        setTenants(prev => prev.filter(t => t._id !== tenantToDelete._id));
        setShowDeleteModal(false);
        setTenantToDelete(null);
        fetchStats();
        toast.success('Tenant deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete tenant');
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error(error.message || 'Failed to delete tenant');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
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

  // Get property display information
  const getPropertyDisplayInfo = (property) => {
    if (!property) return { title: 'N/A', location: 'N/A' };
    
    return {
      title: property.title || property.name || 'Unnamed Property',
      location: property.location?.area || property.location?.address || property.address || 'Location not specified'
    };
  };

  // Calculate real-time stats from tenants data as fallback
  const realTimeStats = calculateStatsFromTenants();

  // Use API stats if available, otherwise use real-time calculated stats
  const displayStats = stats.total > 0 ? stats : realTimeStats;

  // Access control
  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Access</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have permission to manage tenants.
        </p>
      </div>
    );
  }

  if (loading && tenants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" text="Loading tenants..." />
      </div>
    );
  }

  // Page title based on role
  const pageTitle = isAgent ? 'Tenant Management' : 'My Tenants';
  const pageDescription = isAgent 
    ? 'Manage all tenants created by you and your employees' 
    : 'Manage tenants you have created';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-600">{pageDescription}</p>
          {isAgent && (
            <p className="text-sm text-blue-600 mt-1">
              Viewing tenants from your team
            </p>
          )}
        </div>
        <button
          onClick={handleCreateTenant}
          className="btn-primary flex items-center"
          disabled={loading}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Tenant
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Tenants"
          value={displayStats.total}
          loading={statsLoading}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard
          title="Active"
          value={displayStats.active}
          loading={statsLoading}
          icon={UserGroupIcon}
          color="green"
        />
        <StatCard
          title="Inactive"
          value={displayStats.inactive}
          loading={statsLoading}
          icon={UserGroupIcon}
          color="yellow"
        />
        <StatCard
          title="Terminated"
          value={displayStats.terminated}
          loading={statsLoading}
          icon={UserGroupIcon}
          color="red"
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
              placeholder="Search tenants by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={loading}
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCurrentPage(1);
                  fetchTenants();
                }}
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                disabled={loading}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {tenants.length === 0 && !loading ? (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first tenant.
            </p>
            <button
              onClick={handleCreateTenant}
              className="mt-4 btn-primary inline-flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Tenant
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rent Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Move In Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {isAgent && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                    )}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tenants.map((tenant) => {
                    const propertyInfo = getPropertyDisplayInfo(tenant.property);
                    return (
                      <tr key={tenant._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="font-medium text-primary-600">
                                {tenant.user?.firstName?.[0] || 'T'}{tenant.user?.lastName?.[0] || 'T'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {tenant.user?.firstName || 'Unknown'} {tenant.user?.lastName || 'Tenant'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {tenant.user?.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {propertyInfo.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {propertyInfo.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(tenant.rentAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(tenant.moveInDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                            {tenant.status || 'unknown'}
                          </span>
                        </td>
                        {isAgent && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {tenant.createdBy?.firstName || 'Unknown'} {tenant.createdBy?.lastName || 'User'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {tenant.createdBy?.jobTitle || 'Employee'}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewTenant(tenant)}
                              className="text-blue-600 hover:text-blue-900 p-1 transition-colors"
                              title="View Details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {isAgent && (
                              <button
                                onClick={() => handleDeleteTenant(tenant)}
                                className="text-red-600 hover:text-red-900 p-1 transition-colors"
                                title="Delete"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex justify-between items-center w-full">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * tenantsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * tenantsPerPage, totalTenants)}
                    </span>{' '}
                    of <span className="font-medium">{totalTenants}</span> results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Tenant Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Tenant"
        size="2xl"
      >
        <CreateTenantForm
          onSuccess={handleTenantCreated}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Tenant Details Modal */}
      {selectedTenant && (
        <TenantDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTenant(null);
          }}
          tenant={selectedTenant}
          onUpdate={fetchTenants}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Tenant"
        message={`Are you sure you want to delete ${tenantToDelete?.user?.firstName || 'Unknown'} ${tenantToDelete?.user?.lastName || 'Tenant'}? This action cannot be undone.`}
        variant="danger"
      />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, loading, icon: Icon, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colors[color]} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${colors[color].replace('bg-', 'text-')}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantManagement;