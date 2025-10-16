// File: client/src/pages/employee/EmployeePropertyList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  HomeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner, { CardLoader } from '../../components/common/LoadingSpinner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EmployeePropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
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

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || property.approvalStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: ClockIcon,
        text: 'Pending Approval'
      },
      approved: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon,
        text: 'Approved'
      },
      rejected: {
        color: 'bg-red-100 text-red-800',
        icon: XCircleIcon,
        text: 'Rejected'
      }
    };
    return badges[status] || badges.pending;
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600">View and manage properties you've created</p>
        </div>
        <Link 
          to="/employee/properties/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Created</p>
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            </div>
            <HomeIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.approvalStatus === 'pending').length}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.approvalStatus === 'approved').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search properties..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
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
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <CardLoader key={index} />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by adding your first property.'}
              </p>
              <Link 
                to="/employee/properties/new" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Property
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProperties.map((property) => {
                const statusBadge = getStatusBadge(property.approvalStatus);
                const StatusIcon = statusBadge.icon;

                return (
                  <div 
                    key={property._id} 
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
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
                          <HomeIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {property.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {property.location?.address || 'N/A'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            {property.bedrooms !== undefined && (
                              <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                            )}
                            {property.bathrooms !== undefined && (
                              <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                            )}
                            <span>{property.area || 'N/A'} m²</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {property.rent ? formatPrice(property.rent) : 
                             property.price ? formatPrice(property.price) : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {property.rent ? 'per month' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Status & Rejection Reason */}
                      <div className="flex items-center gap-4 mt-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {statusBadge.text}
                        </span>

                        {property.approvalStatus === 'rejected' && property.rejectionReason && (
                          <span className="text-sm text-red-600">
                            Reason: {property.rejectionReason}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      <Link
                        to={`/employee/properties/${property._id}`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg inline-block"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePropertyList;