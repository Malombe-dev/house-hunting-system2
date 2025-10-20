// File: client/src/pages/agent/AgentPropertyDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UnitManagementModal from '../../components/modals/UnitManagementModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ShareIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AgentPropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'units'
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch property');
      }

      const data = await response.json();
      setProperty(data.data.property);
    } catch (error) {
      console.error('Error fetching property:', error);
      alert('Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      alert('Property deleted successfully');
      navigate('/agent/properties');
    } catch (error) {
      console.error('Error deleting property:', error);
      alert(error.message || 'Failed to delete property');
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFeature = (feature) => {
    return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: ClockIcon,
        text: 'Pending Approval'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading property..." />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <button
            onClick={() => navigate('/agent/properties')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(property.approvalStatus);
  const StatusIcon = statusBadge.icon;
  const supportsUnits = ['apartment', 'hostel', 'maisonette', 'bungalow'].includes(property.propertyType);
  const displayImages = property.images && property.images.length > 0 ? property.images : ['/api/placeholder/800/600'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/agent/properties')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Properties
          </button>
          
          <div className="flex gap-3">
            <Link
              to={`/properties/${id}`}
              target="_blank"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-flex items-center"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              View Public Page
            </Link>
            <Link
              to={`/agent/properties/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Property
            </Link>
            {(user.role === 'agent' || user.role === 'admin') && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Property Images */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="relative">
            {/* Main Image */}
            <div className="h-96 relative">
              <img
                src={displayImages[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = '/api/placeholder/800/600'}
              />
              
              {/* Image Navigation */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? displayImages.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                  >
                    <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === displayImages.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                  >
                    <ArrowLeftIcon className="h-6 w-6 text-gray-700 rotate-180" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                    {currentImageIndex + 1} / {displayImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? 'border-blue-600 scale-105'
                        : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = '/api/placeholder/100/100'}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Title and Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span>{property.location?.address}, {property.location?.city}</span>
              </div>
              
              {property.createdBy && (
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span>
                    Created by: {property.createdBy.firstName} {property.createdBy.lastName}
                    {property.createdBy.role === 'employee' && ' (Employee)'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${statusBadge.color}`}>
                <StatusIcon className="h-5 w-5 mr-2" />
                {statusBadge.text}
              </span>
              
              {property.hasUnits && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  <HomeIcon className="h-5 w-5 mr-2" />
                  {property.units?.length || 0} Units
                </span>
              )}

              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 capitalize">
                {property.availability}
              </span>
            </div>
          </div>

          {property.approvalStatus === 'rejected' && property.rejectionReason && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Rejection Reason:</strong> {property.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(property.rent || property.price)}
                </p>
                <p className="text-xs text-gray-500">{property.rent ? 'per month' : ''}</p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Views</p>
                <p className="text-2xl font-bold text-gray-900">{property.views || 0}</p>
                <p className="text-xs text-gray-500">total views</p>
              </div>
              <EyeIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">{property.inquiries || 0}</p>
                <p className="text-xs text-gray-500">total inquiries</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Listed</p>
                <p className="text-lg font-bold text-gray-900">{formatDate(property.createdAt)}</p>
                <p className="text-xs text-gray-500">creation date</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Tabs - Show Units tab only if property supports units */}
        {supportsUnits && (
          <div className="bg-white rounded-t-xl shadow-sm border border-b-0 border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Property Details
              </button>
              <button
                onClick={() => setActiveTab('units')}
                className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'units'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <HomeIcon className="h-5 w-5" />
                Manage Units
                {property.hasUnits && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {property.units?.length || 0}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'details' ? (
            <div className="space-y-8">
              {/* Property Stats */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Property Information</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.bedrooms !== undefined && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Bedrooms</p>
                      <p className="text-2xl font-bold text-blue-600">{property.bedrooms}</p>
                    </div>
                  )}
                  {property.bathrooms !== undefined && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Bathrooms</p>
                      <p className="text-2xl font-bold text-purple-600">{property.bathrooms}</p>
                    </div>
                  )}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Area</p>
                    <p className="text-2xl font-bold text-green-600">
                      {property.area} {['land', 'plot', 'farm'].includes(property.propertyType) ? 'acres' : 'm²'}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="text-lg font-bold text-orange-600 capitalize">
                      {property.propertyType?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {property.description || 'No description available'}
                </p>
              </div>

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Features & Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-800">{formatFeature(feature)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">{property.location?.address}</p>
                      <p className="text-gray-600">{property.location?.area}, {property.location?.city}</p>
                      {property.location?.coordinates && (
                        <p className="text-sm text-gray-500 mt-1">
                          Coordinates: {property.location.coordinates.latitude}, {property.location.coordinates.longitude}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.furnished !== undefined && (
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Furnished</p>
                      <p className="font-semibold text-gray-900">{property.furnished ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {property.petsAllowed !== undefined && (
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Pets Allowed</p>
                      <p className="font-semibold text-gray-900">{property.petsAllowed ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {property.smokingAllowed !== undefined && (
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Smoking Allowed</p>
                      <p className="font-semibold text-gray-900">{property.smokingAllowed ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {property.deposit && (
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Deposit</p>
                      <p className="font-semibold text-gray-900">{formatPrice(property.deposit)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Units Management Tab */
            <div>
              <UnitManagementModal propertyId={id} property={property} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentPropertyDetails;