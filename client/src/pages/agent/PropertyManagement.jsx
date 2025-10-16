import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EditProperty from '../../components/forms/EditPropertyForm';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  HomeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MapPinIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner, { CardLoader } from '../../components/common/LoadingSpinner';
import PropertyCard from '../../components/cards/PropertyCard';
import Modal, { ConfirmModal } from '../../components/common/Modal';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [propertyToApprove, setPropertyToApprove] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch properties
  useEffect(() => {
    fetchProperties();
    fetchPendingProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/properties/my-properties`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch properties');

      const data = await response.json();
      if (data.status === 'success') {
        setProperties(data.data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      alert('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/properties/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setPendingProperties(data.data.properties || []);
        }
      }
    } catch (error) {
      console.error('Error fetching pending properties:', error);
    }
  };

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.area?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || property.availability === statusFilter;
    const matchesType = !typeFilter || property.propertyType === typeFilter;
    const matchesApproval = !approvalFilter || property.approvalStatus === approvalFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesApproval;
  });

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  const handleDeleteProperty = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/properties/${propertyToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete property');
      }

      setProperties(prev => prev.filter(prop => prop._id !== propertyToDelete._id));
      setPendingProperties(prev => prev.filter(prop => prop._id !== propertyToDelete._id));
      alert('Property deleted successfully');
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('Error deleting property:', error);
      alert(error.message || 'Failed to delete property');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveProperty = (property) => {
    setPropertyToApprove(property);
    setShowApprovalModal(true);
    setRejectionReason('');
  };

  const confirmApproval = async (approve = true) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = approve 
        ? `${API_BASE_URL}/properties/${propertyToApprove._id}/approve`
        : `${API_BASE_URL}/properties/${propertyToApprove._id}/reject`;

      const body = approve ? {} : { reason: rejectionReason };

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${approve ? 'approve' : 'reject'} property`);
      }

      const data = await response.json();
      
      // Update properties list
      setProperties(prev => prev.map(prop => 
        prop._id === propertyToApprove._id ? data.data.property : prop
      ));
      
      // Remove from pending list
      setPendingProperties(prev => prev.filter(prop => prop._id !== propertyToApprove._id));
      
      alert(`Property ${approve ? 'approved' : 'rejected'} successfully`);
      setShowApprovalModal(false);
      setPropertyToApprove(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error processing approval:', error);
      alert(error.message || 'Failed to process approval');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ availability: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      const data = await response.json();
      setProperties(prev => prev.map(property => 
        property._id === propertyId ? data.data.property : property
      ));
      
      alert('Property status updated successfully');
    } catch (error) {
      console.error('Error updating property status:', error);
      alert('Failed to update property status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      unavailable: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.available;
  };

  const getApprovalStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const totalRevenue = properties
    .filter(p => p.availability === 'occupied')
    .reduce((sum, p) => sum + (p.rent || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
          <p className="text-gray-600">Manage all your properties and listings</p>
        </div>
        <Link to="/agent/properties/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Property
        </Link>
      </div>

      {/* Pending Approvals Alert */}
      {pendingProperties.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <ClockIcon className="h-6 w-6 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800">
                {pendingProperties.length} Properties Pending Approval
              </h3>
              <p className="text-yellow-700 mt-1">
                Review and approve properties added by employees
              </p>
            </div>
            <button
              onClick={() => setApprovalFilter('pending')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Review Now
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <HomeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <HomeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.availability === 'available').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.availability === 'occupied').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search properties..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="unavailable">Unavailable</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="studio">Studio</option>
              <option value="bedsitter">Bedsitter</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
              <option value="plot">Plot</option>
            </select>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Approvals</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="space-y-1">
                  <div className="h-0.5 w-4 bg-current"></div>
                  <div className="h-0.5 w-4 bg-current"></div>
                  <div className="h-0.5 w-4 bg-current"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Properties ({filteredProperties.length})
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
              {Array.from({ length: 6 }).map((_, index) => (
                <CardLoader key={index} />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter || typeFilter || approvalFilter
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by adding your first property.'}
              </p>
              <Link to="/agent/properties/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Property
              </Link>
            </div>
          ) : viewMode === 'list' ? (
            /* List View */
            <div className="space-y-4">
              {filteredProperties.map((property) => (
                <div key={property._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  {/* Property Image */}
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/400/300';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Property Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{property.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{property.location?.address || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          {property.bedrooms !== undefined && <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>}
                          {property.bathrooms !== undefined && <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>}
                          <span>{property.area || 'N/A'} {property.propertyType === 'land' ? 'acres' : 'm²'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {property.rent ? formatPrice(property.rent) : property.price ? formatPrice(property.price) : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">{property.rent ? 'per month' : ''}</p>
                        <div className="flex flex-col gap-2 mt-2">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(property.availability)}`}>
                            {property.availability}
                          </span>
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize ${getApprovalStatusColor(property.approvalStatus)}`}>
                            {property.approvalStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Property Stats */}
                    <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                      <span>{property.views || 0} views</span>
                      <span>{property.inquiries || 0} inquiries</span>
                      <span>{property.applications || 0} applications</span>
                      {property.createdBy && property.createdBy._id !== property.agent?._id && (
                        <span className="text-blue-600">
                          Created by: {property.createdBy.firstName} {property.createdBy.lastName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      {property.approvalStatus === 'pending' && (
                        <button
                          onClick={() => handleApproveProperty(property)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Approve Property"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewProperty(property)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/agent/properties/${property._id}/edit`}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        title="Edit Property"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProperty(property)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Property"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <div key={property._id} className="relative group">
                  <PropertyCard
                    property={property}
                    showSaveButton={false}
                  />
                  {/* Management Overlay */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {property.approvalStatus === 'pending' && (
                      <button
                        onClick={() => handleApproveProperty(property)}
                        className="p-2 bg-white rounded-lg shadow-sm border hover:bg-green-50"
                        title="Approve"
                      >
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      </button>
                    )}
                    <button
                      onClick={() => handleViewProperty(property)}
                      className="p-2 bg-white rounded-lg shadow-sm border hover:bg-blue-50"
                      title="View"
                    >
                      <EyeIcon className="h-4 w-4 text-blue-600" />
                    </button>
                    <Link
                      to={`/agent/properties/${property._id}/edit`}
                      className="p-2 bg-white rounded-lg shadow-sm border hover:bg-green-50"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4 text-green-600" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProperty(property)}
                      className="p-2 bg-white rounded-lg shadow-sm border hover:bg-red-50"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Property Details Modal - Keeping your existing modal code */}
      {/* ... (keep your existing PropertyDetailsModal) ... */}

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Review Property"
        size="lg"
      >
        {propertyToApprove && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{propertyToApprove.title}</h3>
              <p className="text-gray-600">{propertyToApprove.description}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => confirmApproval(true)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                {actionLoading ? 'Processing...' : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Approve
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  if (!rejectionReason) {
                    setRejectionReason(prompt('Enter rejection reason:') || '');
                    return;
                  }
                  confirmApproval(false);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${propertyToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default PropertyManagement;