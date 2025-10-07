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

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);

  // Mock property data - replace with API call
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock property data
        setProperty({
          _id: id,
          title: 'Modern 2BR Apartment in Westlands',
          description: 'Beautiful modern apartment with stunning city views. Features include a spacious living room, modern kitchen, and two comfortable bedrooms with ample natural light. The property is located in the heart of Westlands, offering easy access to shopping centers, restaurants, and public transportation.',
          rent: 65000,
          deposit: 130000,
          bedrooms: 2,
          bathrooms: 2,
          area: 85,
          propertyType: 'apartment',
          location: {
            address: 'Westlands Road, Nairobi',
            city: 'Nairobi',
            area: 'Westlands',
            coordinates: { lat: -1.2633, lng: 36.8094 }
          },
          images: [
            '/api/placeholder/800/600',
            '/api/placeholder/800/601',
            '/api/placeholder/800/602',
            '/api/placeholder/800/603',
            '/api/placeholder/800/604'
          ],
          features: ['parking', 'security', 'garden', 'elevator', 'internet', 'water_backup'],
          availability: 'available',
          featured: true,
          agent: {
            _id: 'agent1',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com',
            phone: '+254712345678',
            image: '/api/placeholder/100/100',
            rating: 4.8,
            reviewCount: 127,
            responseTime: '2 hours',
            verified: true
          },
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T14:22:00Z',
          viewCount: 1247,
          nearbyAmenities: [
            { name: 'Sarit Centre', type: 'Shopping Mall', distance: '0.5 km' },
            { name: 'Westlands Primary School', type: 'School', distance: '0.8 km' },
            { name: 'Nairobi Hospital', type: 'Hospital', distance: '1.2 km' },
            { name: 'Junction Mall', type: 'Shopping Mall', distance: '1.5 km' }
          ],
          leaseTerms: {
            minLease: 12,
            maxLease: 24,
            noticePeriod: 30,
            petPolicy: 'No pets allowed',
            smokingPolicy: 'Non-smoking'
          }
        });
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleImageNavigation = (direction) => {
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

  const handleSaveProperty = () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: `/properties/${id}` } });
      return;
    }
    setIsSaved(!isSaved);
    // API call to save/unsave property
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: `/properties/${id}` } });
      return;
    }

    setApplicationLoading(true);
    try {
      // API call to submit application
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Show success message and redirect
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setApplicationLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatFeature = (feature) => {
    return feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading property details..." />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/properties')}
            className="btn-primary"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-96 md:h-[500px] bg-gray-900">
        {property.images.length > 0 ? (
          <>
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            {property.images.length > 1 && (
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
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
            
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
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <HomeIcon className="h-16 w-16" />
          </div>
        )}
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
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    Featured
                  </span>
                )}
              </div>
              
              {/* Location & Details */}
              <div className="flex items-center space-x-4 text-gray-600 mb-6">
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-5 w-5" />
                  <span>{property.location.address}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Listed {new Date(property.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <HomeIcon className="h-5 w-5" />
                  <span>{property.viewCount.toLocaleString()} views</span>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedroom{property.bedrooms !== 1 ? 's' : ''}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathroom{property.bathrooms !== 1 ? 's' : ''}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{property.area}</div>
                  <div className="text-sm text-gray-600">m² Area</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 capitalize">{property.propertyType}</div>
                  <div className="text-sm text-gray-600">Property Type</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Features & Amenities */}
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

            {/* Lease Terms */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Lease Terms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600">Minimum Lease</div>
                  <div className="text-lg font-semibold text-gray-900">{property.leaseTerms.minLease} months</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600">Maximum Lease</div>
                  <div className="text-lg font-semibold text-gray-900">{property.leaseTerms.maxLease} months</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600">Notice Period</div>
                  <div className="text-lg font-semibold text-gray-900">{property.leaseTerms.noticePeriod} days</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600">Pet Policy</div>
                  <div className="text-lg font-semibold text-gray-900">{property.leaseTerms.petPolicy}</div>
                </div>
              </div>
            </div>

            {/* Nearby Amenities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nearby Amenities</h2>
              <div className="space-y-3">
                {property.nearbyAmenities.map((amenity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{amenity.name}</div>
                      <div className="text-sm text-gray-600">{amenity.type}</div>
                    </div>
                    <div className="text-sm font-medium text-primary-600">{amenity.distance}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Price & Apply */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(property.rent)}
                </div>
                <div className="text-gray-600">per month</div>
                <div className="text-sm text-gray-500 mt-1">
                  Deposit: {formatPrice(property.deposit)}
                </div>
              </div>

              {property.availability === 'available' ? (
                <div className="space-y-4">
                  <button
                    onClick={handleApply}
                    disabled={applicationLoading}
                    className="w-full btn-primary"
                  >
                    {applicationLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner w-4 h-4 mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full btn-secondary"
                  >
                    Contact Agent
                  </button>
                </div>
              ) : (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-red-800 font-medium">Not Available</div>
                  <div className="text-red-600 text-sm">This property is currently occupied</div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property ID</span>
                  <span className="font-medium">#{property._id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">{new Date(property.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{property.viewCount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Agent Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Property Agent</h3>
              
              <div className="flex items-start space-x-4 mb-4">
                <img
                  src={property.agent.image}
                  alt={`${property.agent.firstName} ${property.agent.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
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
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(property.agent.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {property.agent.rating} ({property.agent.reviewCount} reviews)
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Response time: {property.agent.responseTime}
                  </div>
                </div>
              </div>

              {showContact ? (
                <div className="space-y-3">
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    <span>Call Now</span>
                  </a>
                  
                  <a
                    href={`mailto:${property.agent.email}?subject=Inquiry about ${property.title}&body=Hi, I'm interested in this property and would like to know more details.`}
                    className="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>Send Email</span>
                  </a>
                  
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
                  className="w-full btn-secondary"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Show Contact Info
                </button>
              )}
            </div>

            {/* Similar Properties */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Properties</h3>
              <div className="text-center text-gray-500">
                <p className="text-sm">Loading similar properties...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;