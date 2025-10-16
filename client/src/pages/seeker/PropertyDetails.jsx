import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);

  // Fetch property details from API
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
          headers
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Property not found');
          }
          throw new Error('Failed to fetch property details');
        }

        const data = await response.json();
        
        if (data.status === 'success') {
          setProperty(data.data.property);
        } else {
          throw new Error(data.message || 'Failed to load property');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  // Check if property is saved
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!isAuthenticated || !id) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users/saved-properties`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const saved = data.data?.savedProperties?.some(p => p._id === id);
          setIsSaved(saved || false);
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };

    checkIfSaved();
  }, [id, isAuthenticated]);

  const handleImageNavigation = (direction) => {
    if (!property?.images?.length) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleSaveProperty = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: `/properties/${id}` } });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/saved-properties/${id}`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        // Show success toast
      } else {
        throw new Error('Failed to update saved status');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Failed to save property. Please try again.');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.log('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: `/properties/${id}` } });
      return;
    }

    setApplicationLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId: id,
          message: 'I am interested in this property and would like to schedule a viewing.'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit application');
      }

      const data = await response.json();
      alert('Application submitted successfully! The agent will contact you soon.');
      
      // Optionally redirect to applications page
      // navigate('/dashboard/applications');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setApplicationLoading(false);
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

  const formatFeature = (feature) => {
    return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading property details..." />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'Property not found' ? 'Property Not Found' : 'Error Loading Property'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The property you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate('/properties')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  const displayImages = property.images && property.images.length > 0 
    ? property.images 
    : ['/api/placeholder/800/600'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-96 md:h-[500px] bg-gray-900">
        <img
          src={displayImages[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/api/placeholder/800/600';
          }}
        />
        
        {/* Image Navigation */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={() => handleImageNavigation('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => handleImageNavigation('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </>
        )}
        
        {/* Image Dots */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleSaveProperty}
            className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full transition-colors"
          >
            {isSaved ? (
              <HeartSolidIcon className="h-6 w-6 text-red-500" />
            ) : (
              <HeartIcon className="h-6 w-6" />
            )}
          </button>
          <button
            onClick={handleShare}
            className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full transition-colors"
          >
            <ShareIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                {property.featured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Featured
                  </span>
                )}
                {property.approvalStatus === 'pending' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Pending Approval
                  </span>
                )}
              </div>
              
              {/* Location & Details */}
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-5 w-5" />
                  <span>{property.location?.address || 'Location not specified'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Listed {formatDate(property.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <HomeIcon className="h-5 w-5" />
                  <span>{(property.views || 0).toLocaleString()} views</span>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {property.bedrooms !== undefined && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedroom{property.bedrooms !== 1 ? 's' : ''}</div>
                  </div>
                )}
                {property.bathrooms !== undefined && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathroom{property.bathrooms !== 1 ? 's' : ''}</div>
                  </div>
                )}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{property.area || 'N/A'}</div>
                  <div className="text-sm text-gray-600">
                    {['land', 'plot', 'farm'].includes(property.propertyType) ? 'Acres' : 'm²'}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 capitalize">
                    {property.propertyType?.replace('_', ' ') || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Type</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {property.description || 'No description available'}
              </p>
            </div>

            {/* Features & Amenities */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{formatFeature(feature)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Property Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.furnished !== undefined && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600">Furnished</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {property.furnished ? 'Yes' : 'No'}
                    </div>
                  </div>
                )}
                {property.petsAllowed !== undefined && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600">Pets Allowed</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {property.petsAllowed ? 'Yes' : 'No'}
                    </div>
                  </div>
                )}
                {property.smokingAllowed !== undefined && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600">Smoking Allowed</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {property.smokingAllowed ? 'Yes' : 'No'}
                    </div>
                  </div>
                )}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600">Availability</div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">
                    {property.availability || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            {property.location?.coordinates && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Map integration coming soon</p>
                  {/* You can integrate OpenStreetMap or Google Maps here */}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <MapPinIcon className="h-4 w-4 inline mr-1" />
                  {property.location.address}, {property.location.area}, {property.location.city}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Price & Apply */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  {property.rent ? formatPrice(property.rent) : property.price ? formatPrice(property.price) : 'Contact for Price'}
                </div>
                <div className="text-gray-600">
                  {property.rent ? 'per month' : property.price ? (property.priceType || 'total') : ''}
                </div>
                {property.deposit && (
                  <div className="text-sm text-gray-500 mt-1">
                    Deposit: {formatPrice(property.deposit)}
                  </div>
                )}
              </div>

              {property.availability === 'available' && property.approved ? (
                <div className="space-y-4">
                  <button
                    onClick={handleApply}
                    disabled={applicationLoading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applicationLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Contact Agent
                  </button>
                </div>
              ) : (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-red-800 font-medium">Not Available</div>
                  <div className="text-red-600 text-sm">
                    {property.availability === 'occupied' ? 'This property is currently occupied' : 
                     property.approved === false ? 'This property is pending approval' :
                     'This property is not available'}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property ID</span>
                  <span className="font-medium">#{property._id?.slice(-6).toUpperCase() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">{formatDate(property.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{(property.views || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Agent Info */}
            {property.agent && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Property Agent</h3>
                
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={property.agent.avatar || property.agent.image || '/api/placeholder/100/100'}
                    alt={`${property.agent.firstName} ${property.agent.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/100/100';
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {property.agent.firstName} {property.agent.lastName}
                      </h4>
                      {property.agent.verified && (
                        <CheckCircleIcon className="h-5 w-5 text-blue-500" title="Verified Agent" />
                      )}
                    </div>
                    
                    {property.agent.businessName && (
                      <div className="text-sm text-gray-600 mb-2">
                        {property.agent.businessName}
                      </div>
                    )}
                  </div>
                </div>

                {showContact ? (
                  <div className="space-y-3">
                    {property.agent.phone && (
                      <a
                        href={`tel:${property.agent.phone}`}
                        className="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        <span>Call Now</span>
                      </a>
                    )}
                    
                    {property.agent.email && (
                      <a
                        href={`mailto:${property.agent.email}?subject=Inquiry about ${property.title}&body=Hi, I'm interested in this property and would like to know more details.`}
                        className="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                        <span>Send Email</span>
                      </a>
                    )}
                    
                    <div className="text-center">
                      <button
                        onClick={() => setShowContact(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Hide contact info
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Show Contact Info
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;