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
  
  // 🆕 NEW: State for units
  const [availableUnits, setAvailableUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

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
          
          // 🆕 NEW: If property has units, fetch available units
          if (data.data.property.hasUnits) {
            try {
              const unitsResponse = await fetch(`${API_BASE_URL}/properties/${id}/available-units`);
              const unitsData = await unitsResponse.json();
              
              if (unitsData.status === 'success') {
                setAvailableUnits(unitsData.data.availableUnits);
              }
            } catch (unitsError) {
              console.error('Error fetching units:', unitsError);
            }
          }
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

  // 🆕 NEW: Handle unit-specific inquiry
  const handleUnitInquiry = (unit = null) => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: `/properties/${id}` } });
      return;
    }

    // You can integrate this with your existing inquiry/application system
    const unitInfo = unit ? `Unit ${unit.unitNumber}` : 'the property';
    alert(`Inquiry submitted for ${unitInfo}. The agent will contact you soon.`);
    
    // TODO: Integrate with your actual inquiry API
    // For example:
    // submitInquiry({ propertyId: id, unitId: unit?._id, message: `Interested in ${unitInfo}` });
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
          unitId: selectedUnit?._id, // 🆕 NEW: Include unit if selected
          message: selectedUnit 
            ? `I am interested in Unit ${selectedUnit.unitNumber} and would like to schedule a viewing.`
            : 'I am interested in this property and would like to schedule a viewing.'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit application');
      }

      alert('Application submitted successfully! The agent will contact you soon.');
      setSelectedUnit(null);
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

            {/* 🆕 NEW: Available Units Section */}
            {property.hasUnits && availableUnits.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"></div>
                    Available Units ({availableUnits.length})
                  </h2>
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {availableUnits.length} unit{availableUnits.length !== 1 ? 's' : ''} available
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableUnits.map((unit) => (
                    <div 
                      key={unit._id}
                      className="group border-2 border-gray-200 hover:border-blue-400 rounded-xl p-5 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-blue-50/30 cursor-pointer"
                      onClick={() => setSelectedUnit(unit)}
                    >
                      {/* Unit Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Unit {unit.unitNumber}
                          </h3>
                          {unit.floor && (
                            <p className="text-sm text-gray-600">Floor {unit.floor}</p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Available
                        </span>
                      </div>

                      {/* Unit Details */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <HomeIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {unit.bedrooms} BR, {unit.bathrooms} BA
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span className="text-sm text-gray-700">{unit.area} m²</span>
                        </div>
                        {unit.furnished && (
                          <span className="col-span-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium inline-block w-fit">
                            Furnished
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Monthly Rent</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {formatPrice(unit.rent)}
                            </p>
                          </div>
                        </div>
                        {unit.deposit > 0 && (
                          <p className="text-xs text-gray-500 mb-3">
                            Deposit: {formatPrice(unit.deposit)}
                          </p>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnitInquiry(unit);
                          }}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Inquire About This Unit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"></div>
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {property.description || 'No description available for this property.'}
              </p>
            </div>

            {/* Features & Amenities */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"></div>
                  Features & Amenities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{formatFeature(feature)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Section */}
            {property.location && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-full"></div>
                  Location
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-6 w-6 text-red-500" />
                    <div>
                      <p className="font-semibold text-gray-900">{property.location.address}</p>
                      {property.location.city && (
                        <p className="text-gray-600">{property.location.city}, {property.location.state}</p>
                      )}
                    </div>
                  </div>
                  {/* Map placeholder - you can integrate with Google Maps or other mapping service */}
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
                      <p>Map View</p>
                      <p className="text-sm">Interactive map would be displayed here</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Price Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(property.price)}
                    </span>
                  </div>
                  {property.priceType && (
                    <p className="text-gray-600 capitalize">{property.priceType}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleApply}
                    disabled={applicationLoading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {applicationLoading ? (
                      <>
                        <LoadingSpinner size="small" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        Apply Now
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <PhoneIcon className="h-5 w-5" />
                    Contact Agent
                  </button>

                  <button
                    onClick={handleSaveProperty}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {isSaved ? (
                      <>
                        <HeartSolidIcon className="h-5 w-5" />
                        Saved
                      </>
                    ) : (
                      <>
                        <HeartIcon className="h-5 w-5" />
                        Save Property
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Agent Info Card */}
              {property.agent && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Listed By</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{property.agent.name}</h4>
                      <p className="text-gray-600 text-sm">{property.agent.company}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm text-gray-500 ml-1">(4.9)</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <PhoneIcon className="h-4 w-4" />
                      Call Agent
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                      <EnvelopeIcon className="h-4 w-4" />
                      Send Message
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Facts */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Property Facts</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Property ID</span>
                    <span className="font-semibold text-gray-900">{property._id?.slice(-8) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Type</span>
                    <span className="font-semibold text-gray-900 capitalize">{property.propertyType?.replace('_', ' ') || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Availability</span>
                    <span className="font-semibold text-green-600 capitalize">{property.availability || 'Available'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Listed</span>
                    <span className="font-semibold text-gray-900">{formatDate(property.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Views</span>
                    <span className="font-semibold text-gray-900">{(property.views || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Contact Agent</h3>
              <button
                onClick={() => setShowContact(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <PhoneIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">+254 700 000 000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <EnvelopeIcon className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">agent@example.com</p>
                </div>
              </div>
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;