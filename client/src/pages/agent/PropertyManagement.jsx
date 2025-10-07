import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  HomeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MapPinIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner, { CardLoader } from '../../components/common/LoadingSpinner';
import PropertyCard from '../../components/cards/PropertyCard';
import Modal, { ConfirmModal } from '../../components/common/Modal';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  // Mock properties data - replace with API call
  const mockProperties = [
    {
      _id: '1',
      title: 'Modern 2BR Apartment in Westlands',
      description: 'Beautiful modern apartment with stunning city views and premium amenities.',
      rent: 65000,
      deposit: 130000,
      bedrooms: 2,
      bathrooms: 2,
      area: 85,
      propertyType: 'apartment',
      location: {
        address: 'Westlands Road, Nairobi',
        city: 'Nairobi',
        area: 'Westlands'
      },
      images: ['/api/placeholder/400/300', '/api/placeholder/400/301'],
      features: ['parking', 'security', 'garden', 'elevator'],
      availability: 'available',
      featured: true,
      tenant: null,
      views: 234,
      inquiries: 12,
      applications: 3,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:22:00Z'
    },
    {
      _id: '2',
      title: 'Spacious 3BR House in Karen',
      description: 'Family-friendly house in serene Karen area with large compound.',
      rent: 120000,
      deposit: 240000,
      bedrooms: 3,
      bathrooms: 3,
      area: 150,
      propertyType: 'house',
      location: {
        address: 'Karen Road, Nairobi',
        city: 'Nairobi',
        area: 'Karen'
      },
      images: ['/api/placeholder/400/302', '/api/placeholder/400/303'],
      features: ['parking', 'garden', 'swimming_pool', 'security'],
      availability: 'occupied',
      featured: false,
      tenant: {
        name: 'John Doe',
        phone: '+254712345678',
        leaseStart: '2023-06-01',
        leaseEnd: '2024-06-01'
      },
      views: 156,
      inquiries: 8,
      applications: 5,
      createdAt: '2024-01-10T15:45:00Z',
      updatedAt: '2024-01-18T09:30:00Z'
    },
    {
      _id: '3',
      title: 'Studio Apartment in Kilimani',
      description: 'Compact and efficient studio perfect for young professionals.',
      rent: 35000,
      deposit: 70000,
      bedrooms: 0,
      bathrooms: 1,
      area: 40,
      propertyType: 'studio',
      location: {
        address: 'Kilimani Road, Nairobi',
        city: 'Nairobi',
        area: 'Kilimani'
      },
      images: ['/api/placeholder/400/304'],
      features: ['security', 'elevator', 'internet'],
      availability: 'maintenance',
      featured: false,
      tenant: null,
      views: 89,
      inquiries: 4,
      applications: 1,
      createdAt: '2024-01-08T11:20:00Z',
      updatedAt: '2024-01-22T16:15:00Z'
    }
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProperties(mockProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || property.availability === statusFilter;
    const matchesType = !typeFilter || property.propertyType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
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
    try {
      // API call to delete property
      setProperties(prev => prev.filter(prop => prop._id !== propertyToDelete._id));
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      // API call to update property status
      setProperties(prev => prev.map(property => 
        property._id === propertyId ? { ...property, availability: newStatus } : property
      ));
    } catch (error) {
      console.error('Error updating property status:', error);
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

  const formatPrice = (price) => {
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
          <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
          <p className="text-gray-600">Manage all your properties and listings</p>
        </div>
        <Link to="/agent/properties/new" className="btn-primary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Property
        </Link>
      </div>

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
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(properties.reduce((sum, p) => sum + p.rent, 0))}
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="studio">Studio</option>
              <option value="commercial">Commercial</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-secondary-50 text-secondary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
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
            <div className={viewMode === 'grid' ? 'grid-properties' : 'space-y-6'}>
              {Array.from({ length: 6 }).map((_, index) => (
                <CardLoader key={index} />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter || typeFilter
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by adding your first property.'}
              </p>
              <Link to="/agent/properties/new" className="btn-primary">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Property
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid-properties">
              {filteredProperties.map((property) => (
                <div key={property._id} className="relative">
                  <PropertyCard
                    property={property}
                    showSaveButton={false}
                  />
                  {/* Property Management Overlay */}
                  <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm border border-gray-200 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleViewProperty(property)}
                        className="p-1 text-gray-600 hover:text-blue-600"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/agent/properties/${property._id}/edit`}
                        className="p-1 text-gray-600 hover:text-green-600"
                        title="Edit Property"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProperty(property)}
                        className="p-1 text-gray-600 hover:text-red-600"
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
            /* List View */
            <div className="space-y-4">
              {filteredProperties.map((property) => (
                <div key={property._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  {/* Property Image */}
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
                    {property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
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
                          <span className="text-sm text-gray-600">{property.location.address}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                          <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                          <span>{property.area} m²</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{formatPrice(property.rent)}</p>
                        <p className="text-sm text-gray-500">per month</p>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize mt-2 ${getStatusColor(property.availability)}`}>
                          {property.availability}
                        </span>
                      </div>
                    </div>

                    {/* Property Stats */}
                    <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                      <span>{property.views} views</span>
                      <span>{property.inquiries} inquiries</span>
                      <span>{property.applications} applications</span>
                      {property.tenant && (
                        <span className="text-blue-600">Tenant: {property.tenant.name}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center space-x-2">
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
          )}
        </div>
      </div>

      {/* Property Details Modal */}
      <Modal
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        title="Property Details"
        size="xl"
      >
        {selectedProperty && (
          <div className="space-y-6">
            {/* Property Header */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
                {selectedProperty.images.length > 0 ? (
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedProperty.title}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{selectedProperty.location.address}</span>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusColor(selectedProperty.availability)}`}>
                    {selectedProperty.availability}
                  </span>
                  {selectedProperty.featured && (
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(selectedProperty.rent)} / month
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{selectedProperty.bedrooms}</div>
                <div className="text-sm text-gray-600">Bedroom{selectedProperty.bedrooms !== 1 ? 's' : ''}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{selectedProperty.bathrooms}</div>
                <div className="text-sm text-gray-600">Bathroom{selectedProperty.bathrooms !== 1 ? 's' : ''}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{selectedProperty.area}</div>
                <div className="text-sm text-gray-600">m² Area</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 capitalize">{selectedProperty.propertyType}</div>
                <div className="text-sm text-gray-600">Type</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600">{selectedProperty.description}</p>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProperty.features.map((feature, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Performance</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{selectedProperty.views}</div>
                  <div className="text-xs text-gray-600">Views</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{selectedProperty.inquiries}</div>
                  <div className="text-xs text-gray-600">Inquiries</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{selectedProperty.applications}</div>
                  <div className="text-xs text-gray-600">Applications</div>
                </div>
              </div>
            </div>

            {/* Tenant Information */}
            {selectedProperty.tenant && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Current Tenant</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{selectedProperty.tenant.name}</p>
                      <p className="text-sm text-gray-600">{selectedProperty.tenant.phone}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-600">Lease: {new Date(selectedProperty.tenant.leaseStart).toLocaleDateString()} - {new Date(selectedProperty.tenant.leaseEnd).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Link
                to={`/agent/properties/${selectedProperty._id}/edit`}
                className="btn-secondary"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Property
              </Link>
              <button
                onClick={() => {
                  setShowPropertyModal(false);
                  handleDeleteProperty(selectedProperty);
                }}
                className="btn-danger"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Property
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
      />
    </div>
  );
};

export default PropertyManagement;