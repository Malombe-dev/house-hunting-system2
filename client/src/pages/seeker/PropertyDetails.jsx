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
  XMarkIcon,
  PhotoIcon,
  MagnifyingGlassIcon
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
  const [showGallery, setShowGallery] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showPriceModal, setShowPriceModal] = useState(false);

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/properties/${id}`, { headers });

        if (!response.ok) {
          if (response.status === 404) throw new Error('Property not found');
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

    if (id) fetchProperty();
  }, [id]);

  // Check if saved
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!isAuthenticated || !id) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users/saved-properties`, {
          headers: { 'Authorization': `Bearer ${token}` }
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
    
    setImageLoading(true);
    if (direction === 'prev') {
      setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1);
    } else {
      setCurrentImageIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1);
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

      if (response.ok) setIsSaved(!isSaved);
      else throw new Error('Failed to update saved status');
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
        if (error.name !== 'AbortError') console.log('Error sharing:', error);
      }
    } else {
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

      alert('Application submitted successfully! The agent will contact you soon.');
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Enhanced Hero Section with Grid Gallery */}
      <div className="relative bg-black">
        {displayImages.length === 1 ? (
          /* Single Image - Full Width */
          <div className="relative h-[60vh] md:h-[70vh] overflow-hidden group">
            <img
              src={displayImages[0]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onLoad={() => setImageLoading(false)}
              onError={(e) => e.target.src = '/api/placeholder/1200/800'}
            />
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-900 animate-pulse flex items-center justify-center">
                <PhotoIcon className="h-16 w-16 text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />
          </div>
        ) : displayImages.length === 2 ? (
          /* Two Images - Side by Side */
          <div className="grid grid-cols-2 gap-1 h-[60vh] md:h-[70vh]">
            {displayImages.slice(0, 2).map((img, idx) => (
              <div 
                key={idx}
                className="relative overflow-hidden group cursor-pointer"
                onClick={() => { setCurrentImageIndex(idx); setShowGallery(true); }}
              >
                <img
                  src={img}
                  alt={`${property.title} - ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => e.target.src = '/api/placeholder/800/600'}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </div>
            ))}
          </div>
        ) : (
          /* Multiple Images - Grid Layout */
          <div className="grid grid-cols-4 gap-1 h-[60vh] md:h-[70vh]">
            {/* Main large image */}
            <div 
              className="col-span-4 md:col-span-2 md:row-span-2 relative overflow-hidden group cursor-pointer"
              onClick={() => { setCurrentImageIndex(0); setShowGallery(true); }}
            >
              <img
                src={displayImages[0]}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => e.target.src = '/api/placeholder/1200/800'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
            </div>

            {/* Smaller images */}
            {displayImages.slice(1, 5).map((img, idx) => (
              <div 
                key={idx + 1}
                className="col-span-2 md:col-span-1 relative overflow-hidden group cursor-pointer"
                onClick={() => { setCurrentImageIndex(idx + 1); setShowGallery(true); }}
              >
                <img
                  src={img}
                  alt={`${property.title} - ${idx + 2}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => e.target.src = '/api/placeholder/600/400'}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                {idx === 3 && displayImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <PhotoIcon className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-2xl font-bold">+{displayImages.length - 5}</p>
                      <p className="text-sm">More Photos</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Floating Action Buttons */}
        <div className="absolute top-6 right-6 flex gap-3 z-10">
          <button
            onClick={handleShare}
            className="group bg-white/95 backdrop-blur-sm hover:bg-white p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ShareIcon className="h-5 w-5 text-gray-700 group-hover:text-blue-600" />
          </button>
          <button
            onClick={handleSaveProperty}
            className="group bg-white/95 backdrop-blur-sm hover:bg-white p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-110"
          >
            {isSaved ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-700 group-hover:text-red-500" />
            )}
          </button>
        </div>

        {/* View All Photos Button */}
        {displayImages.length > 1 && (
          <button
            onClick={() => setShowGallery(true)}
            className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm hover:bg-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 group z-10"
          >
            <PhotoIcon className="h-5 w-5 text-gray-700 group-hover:text-blue-600" />
            <span className="font-medium text-gray-900">View All {displayImages.length} Photos</span>
          </button>
        )}

        {/* Property Badge Overlay */}
        <div className="absolute bottom-6 left-6 flex gap-3 z-10">
          {property.featured && (
            <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          )}
          <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-900 rounded-xl font-semibold shadow-lg capitalize">
            {property.availability || 'Available'}
          </span>
        </div>
      </div>

      {/* Fullscreen Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 z-50 bg-white/10 backdrop-blur-sm hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={displayImages[currentImageIndex]}
              alt={`${property.title} - ${currentImageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
              onError={(e) => e.target.src = '/api/placeholder/1200/800'}
            />

            {/* Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={() => handleImageNavigation('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 p-4 rounded-full transition-all"
                >
                  <ChevronLeftIcon className="h-8 w-8 text-white" />
                </button>
                <button
                  onClick={() => handleImageNavigation('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 p-4 rounded-full transition-all"
                >
                  <ChevronRightIcon className="h-8 w-8 text-white" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
              {currentImageIndex + 1} / {displayImages.length}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-20 left-0 right-0 px-4">
            <div className="flex gap-2 justify-center overflow-x-auto pb-2 scrollbar-hide">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentImageIndex
                      ? 'border-white scale-110'
                      : 'border-transparent opacity-60 hover:opacity-100'
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
          </div>
        </div>
      )}

      {/* Rest of the component remains the same... */}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Header with Animation */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {property.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                  <MapPinIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{property.location?.address || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Listed {formatDate(property.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HomeIcon className="h-5 w-5" />
                  <span>{(property.views || 0).toLocaleString()} views</span>
                </div>
              </div>

              {/* Property Stats with Enhanced Design */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.bedrooms !== undefined && (
                  <div className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{property.bedrooms}</div>
                    <div className="text-sm text-blue-900 font-medium">Bedroom{property.bedrooms !== 1 ? 's' : ''}</div>
                  </div>
                )}
                {property.bathrooms !== undefined && (
                  <div className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{property.bathrooms}</div>
                    <div className="text-sm text-purple-900 font-medium">Bathroom{property.bathrooms !== 1 ? 's' : ''}</div>
                  </div>
                )}
                <div className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">{property.area || 'N/A'}</div>
                  <div className="text-sm text-green-900 font-medium">
                    {['land', 'plot', 'farm'].includes(property.propertyType) ? 'Acres' : 'm²'}
                  </div>
                </div>
                <div className="group bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="text-lg font-bold text-orange-600 mb-1 capitalize">
                    {property.propertyType?.replace('_', ' ') || 'N/A'}
                  </div>
                  <div className="text-sm text-orange-900 font-medium">Type</div>
                </div>
              </div>
            </div>

            {/* Description with Better Styling */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                {property.description || 'No description available'}
              </p>
            </div>

            {/* Features with Modern Cards */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"></div>
                  Features & Amenities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.features.map((feature, index) => (
                    <div key={index} className="group flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all duration-300 hover:scale-105">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <CheckCircleIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{formatFeature(feature)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                Additional Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {property.furnished !== undefined && (
                  <div className="group p-6 border-2 border-gray-100 hover:border-purple-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md bg-gradient-to-br from-white to-purple-50/30">
                    <div className="text-sm text-gray-600 mb-2">Furnished</div>
                    <div className="text-xl font-bold text-gray-900">
                      {property.furnished ? '✓ Yes' : '✗ No'}
                    </div>
                  </div>
                )}
                {property.petsAllowed !== undefined && (
                  <div className="group p-6 border-2 border-gray-100 hover:border-blue-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md bg-gradient-to-br from-white to-blue-50/30">
                    <div className="text-sm text-gray-600 mb-2">Pets Allowed</div>
                    <div className="text-xl font-bold text-gray-900">
                      {property.petsAllowed ? '✓ Yes' : '✗ No'}
                    </div>
                  </div>
                )}
                {property.smokingAllowed !== undefined && (
                  <div className="group p-6 border-2 border-gray-100 hover:border-orange-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md bg-gradient-to-br from-white to-orange-50/30">
                    <div className="text-sm text-gray-600 mb-2">Smoking Allowed</div>
                    <div className="text-xl font-bold text-gray-900">
                      {property.smokingAllowed ? '✓ Yes' : '✗ No'}
                    </div>
                  </div>
                )}
                <div className="group p-6 border-2 border-gray-100 hover:border-green-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md bg-gradient-to-br from-white to-green-50/30">
                  <div className="text-sm text-gray-600 mb-2">Availability</div>
                  <div className="text-xl font-bold text-gray-900 capitalize">
                    {property.availability || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Price & Contact */}
          <div className="space-y-6">
            {/* Enhanced Price Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 sticky top-8 text-white">
              <div className="text-center mb-6">
                <div className="text-sm font-medium text-blue-100 mb-2">Price</div>
                <div className="text-5xl font-bold mb-2">
                  {property.rent ? formatPrice(property.rent) : property.price ? formatPrice(property.price) : 'Contact'}
                </div>
                <div className="text-blue-100 text-lg">
                  {property.rent ? 'per month' : ''}
                </div>
                {property.deposit && (
                  <div className="mt-4 text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
                    Deposit: {formatPrice(property.deposit)}
                  </div>
                )}
              </div>

              {property.availability === 'available' && property.approved ? (
                <div className="space-y-4">
                  <button
                    onClick={handleApply}
                    disabled={applicationLoading}
                    className="w-full px-6 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:shadow-2xl"
                  >
                    {applicationLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300"
                  >
                    Contact Agent
                  </button>
                </div>
              ) : (
                <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20">
                  <XCircleIcon className="h-12 w-12 text-white mx-auto mb-3" />
                  <div className="text-white font-bold text-lg mb-2">Not Available</div>
                  <div className="text-blue-100 text-sm">
                    {property.availability === 'occupied' ? 'This property is currently occupied' : 
                     property.approved === false ? 'This property is pending approval' :
                     'This property is not available'}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-white/20 space-y-3 text-sm">
                <div className="flex justify-between items-center text-blue-100">
                  <span>Property ID</span>
                  <span className="font-bold text-white">#{property._id?.slice(-6).toUpperCase() || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-blue-100">
                  <span>Last Updated</span>
                  <span className="font-bold text-white">{formatDate(property.updatedAt)}</span>
                </div>
                <div className="flex justify-between items-center text-blue-100">
                  <span>Views</span>
                  <span className="font-bold text-white">{(property.views || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Agent Card */}
            {property.agent && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  Property Agent
                </h3>
                
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative">
                    <img
                      src={property.agent.avatar || property.agent.image || '/api/placeholder/100/100'}
                      alt={`${property.agent.firstName} ${property.agent.lastName}`}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-100"
                      onError={(e) => e.target.src = '/api/placeholder/100/100'}
                    />
                    {property.agent.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                        <CheckCircleIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">
                      {property.agent.firstName} {property.agent.lastName}
                    </h4>
                    
                    {property.agent.businessName && (
                      <div className="text-sm text-gray-600 mb-2 font-medium">
                        {property.agent.businessName}
                      </div>
                    )}
                    
                    {property.agent.verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
                        <CheckCircleIcon className="h-3 w-3" />
                        Verified Agent
                      </span>
                    )}
                  </div>
                </div>

                {showContact ? (
                  <div className="space-y-3">
                    {property.agent.phone && (
                      <a
                        href={`tel:${property.agent.phone}`}
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        <PhoneIcon className="h-5 w-5" />
                        <span>Call Now</span>
                      </a>
                    )}
                    
                    {property.agent.email && (
                      <a
                        href={`mailto:${property.agent.email}?subject=Inquiry about ${property.title}&body=Hi, I'm interested in this property and would like to know more details.`}
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        <EnvelopeIcon className="h-5 w-5" />
                        <span>Send Email</span>
                      </a>
                    )}
                    
                    <button
                      onClick={() => setShowContact(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 w-full text-center py-2"
                    >
                      Hide contact info
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-2 border-gray-200 text-gray-700 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <UserIcon className="h-5 w-5" />
                    Show Contact Info
                  </button>
                )}
              </div>
            )}

            {/* Safety Badge */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Verified Listing</h4>
              <p className="text-sm text-gray-600">
                This property has been verified and approved by our team for your safety.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PropertyDetails;