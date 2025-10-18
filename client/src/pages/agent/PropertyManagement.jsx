
// File: client/src/pages/agent/AgentPropertyList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  HomeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner, { CardLoader } from '../../components/common/LoadingSpinner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [propertiesByCreator, setPropertiesByCreator] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'byCreator'
  const {user} = useAuth()

  useEffect(() => {
    fetchCompanyProperties();
  }, []);

  const fetchCompanyProperties = async () => {
    setLoading(true);
    try {
      console.log('🔄 Starting company properties fetch...');
  
      const response = await api.get('/properties/company-properties');
      console.log('📦 RAW API RESPONSE:', response);
      console.log('📊 RESPONSE DATA:', response.data);
  
      // Check the structure - it might be nested under 'data'
      const apiData = response.data.data || response.data;
      
      console.log('🎯 EXTRACTED DATA:', {
        properties: apiData.properties,
        propertiesByCreator: apiData.propertiesByCreator,
        stats: apiData.stats,
        employees: apiData.employees
      });
  
      console.log('📈 DATA COUNTS:', {
        propertiesCount: apiData.properties?.length,
        propertiesByCreatorCount: apiData.propertiesByCreator?.length,
        employeesCount: apiData.employees?.length,
        stats: apiData.stats
      });
  
      // Log each property individually
      if (apiData.properties) {
        console.log('🏠 INDIVIDUAL PROPERTIES:');
        apiData.properties.forEach((property, index) => {
          console.log(`   Property ${index + 1}:`, {
            id: property._id,
            title: property.title,
            createdById: property.createdBy?._id,
            createdByName: property.createdBy ? `${property.createdBy.firstName} ${property.createdBy.lastName}` : 'None',
            agentId: property.agent?._id,
            approvalStatus: property.approvalStatus,
            availability: property.availability
          });
        });
      }
  
      // Log propertiesByCreator structure
      if (apiData.propertiesByCreator) {
        console.log('👥 PROPERTIES BY CREATOR:');
        apiData.propertiesByCreator.forEach((group, index) => {
          console.log(`   Group ${index + 1}:`, {
            creator: `${group.creator.firstName} ${group.creator.lastName}`,
            propertiesCount: group.properties.length,
            properties: group.properties.map(p => p.title)
          });
        });
      }
  
      // Set the data
      setProperties(apiData.properties || []);
      setStats(apiData.stats || null);
      setPropertiesByCreator(apiData.propertiesByCreator || []);
      setEmployees(apiData.employees || []);
  
      console.log('✅ DATA SET IN STATE SUCCESSFULLY');
  
    } catch (error) {
      console.error('❌ Error fetching properties:', error);
      alert('Failed to load company properties');
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || property.approvalStatus === statusFilter;
    
    const matchesCreator = !creatorFilter || 
      property.createdBy._id === creatorFilter ||
      (creatorFilter === 'me' && property.agent._id === property.createdBy._id);
    
    return matchesSearch && matchesStatus && matchesCreator;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: ClockIcon,
        text: 'Pending'
      },
      approved: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircleIcon,
        text: 'Approved'
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-200',
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
          <h1 className="text-2xl font-bold text-gray-900">Company Properties</h1>
          <p className="text-gray-600">Manage all properties across your organization</p>
        </div>
        <Link 
          to="/agent/properties/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Property
        </Link>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Company Properties - Highlighted */}
          <div className="md:col-span-2 bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100 mb-1">Total Company Properties</p>
                <p className="text-4xl font-bold mb-2">{stats.totalProperties}</p>
                <div className="flex items-center gap-4 text-sm text-blue-100">
                  <span>{stats.myDirectProperties} direct</span>
                  <span>•</span>
                  <span>{stats.employeeProperties} from {stats.totalEmployees} employees</span>
                </div>
              </div>
              <BuildingOfficeIcon className="h-16 w-16 text-blue-300 opacity-50" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-blue-600">{stats.occupied}</p>
              </div>
              <HomeIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircleIcon className="h-8 w-8 text-red-500" />
            </div>
          </div>

          {/* Financial Stats */}
          <div className="md:col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl shadow-sm border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expected Monthly Rent</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(stats.totalExpectedRent)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Potential: {formatPrice(stats.totalPotentialRent)}
                </p>
              </div>
              <ChartBarIcon className="h-10 w-10 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* View Toggle & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Properties
            </button>
            <button
              onClick={() => setViewMode('byCreator')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'byCreator'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              By Creator
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Creators</option>
              <option value="me">My Properties</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>

            {(searchTerm || statusFilter || creatorFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCreatorFilter('');
                }}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Properties Display */}
      {viewMode === 'all' ? (
        <PropertiesList 
          properties={filteredProperties}
          loading={loading}
          getStatusBadge={getStatusBadge}
          formatPrice={formatPrice}
        />
      ) : (
        <PropertiesByCreator
          propertiesByCreator={propertiesByCreator}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          loading={loading}
          getStatusBadge={getStatusBadge}
          formatPrice={formatPrice}
        />
      )}
    </div>
  );
};

// Properties List Component
const PropertiesList = ({ properties, loading, getStatusBadge, formatPrice }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardLoader key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600">Try adjusting your filters or add a new property.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Properties ({properties.length})
        </h3>
      </div>

      <div className="p-6 space-y-4">
        {properties.map((property) => (
          <PropertyCard 
            key={property._id}
            property={property}
            getStatusBadge={getStatusBadge}
            formatPrice={formatPrice}
            showCreator={true}
          />
        ))}
      </div>
    </div>
  );
};

// Properties By Creator Component
const PropertiesByCreator = ({ propertiesByCreator, searchTerm, statusFilter, loading, getStatusBadge, formatPrice }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <CardLoader />
          </div>
        ))}
      </div>
    );
  }

  // Filter properties within each creator group
  const filteredByCreator = propertiesByCreator.map(group => ({
    ...group,
    properties: group.properties.filter(property => {
      const matchesSearch = !searchTerm ||
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || property.approvalStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
  })).filter(group => group.properties.length > 0);

  if (filteredByCreator.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600">No properties match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredByCreator.map((group) => (
        <div key={group.creator._id} className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {group.creator.firstName[0]}{group.creator.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {group.creator.firstName} {group.creator.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">{group.creator.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{group.properties.length}</p>
                <p className="text-sm text-gray-500">properties</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {group.properties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                getStatusBadge={getStatusBadge}
                formatPrice={formatPrice}
                showCreator={false}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Property Card Component
const PropertyCard = ({ property, getStatusBadge, formatPrice, showCreator }) => {
  const statusBadge = getStatusBadge(property.approvalStatus);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
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
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {property.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {property.location?.address || 'N/A'}
            </p>
            
            {showCreator && property.createdBy && (
              <p className="text-xs text-gray-500 mt-1">
                Created by: {property.createdBy.firstName} {property.createdBy.lastName}
                {property.createdBy.role === 'employee' && ' (Employee)'}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              {property.bedrooms !== undefined && (
                <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
              )}
              {property.bathrooms !== undefined && (
                <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
              )}
              <span>{property.area || 'N/A'} m²</span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 mt-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {statusBadge.text}
              </span>

              {property.approvalStatus === 'rejected' && property.rejectionReason && (
                <span className="text-xs text-red-600 italic">
                  Reason: {property.rejectionReason}
                </span>
              )}
            </div>
          </div>

          <div className="text-right ml-4">
            <p className="text-xl font-bold text-gray-900">
              {property.rent ? formatPrice(property.rent) : 
               property.price ? formatPrice(property.price) : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              {property.rent ? 'per month' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-2">
        <Link
          to={`/agent/properties/${property._id}`}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg inline-flex items-center"
          title="View Details"
        >
          <EyeIcon className="h-5 w-5" />
        </Link>
        <Link
          to={`/agent/properties/${property._id}/edit`}
          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg inline-flex items-center"
          title="Edit Property"
        >
          <PencilIcon className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

export default PropertyManagement;