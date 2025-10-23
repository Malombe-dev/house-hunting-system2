import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon,
  MapPinIcon,
  HomeIcon,
  BanknotesIcon,
  CalendarIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import UnitManagementModal from '../modals/AddUnitsModal';

const PropertyCard = ({ 
  property, 
  onSave, 
  isSaved = false, 
  showSaveButton = true,
  className = '',
  onPropertyUpdate // 🆕 Add this prop to refresh property list
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [enablingUnits, setEnablingUnits] = useState(false); // 🆕 Loading state

  // 🆕 Function to enable units for this property
  const enableUnitsForProperty = async () => {
    setEnablingUnits(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/properties/${property._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hasUnits: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to enable units');
      }

      const result = await response.json();
      console.log('Property updated:', result);
      
      // Refresh the property data
      if (onPropertyUpdate) {
        onPropertyUpdate();
      }
      
      return true;
    } catch (error) {
      console.error('Error enabling units:', error);
      alert('Failed to enable units for this property');
      return false;
    } finally {
      setEnablingUnits(false);
    }
  };

  // 🆕 Handle the unit management button click
  const handleUnitManagement = async () => {
    // If property doesn't have units enabled yet, enable them first
    if (!property.hasUnits) {
      const success = await enableUnitsForProperty();
      if (!success) return; // Stop if enabling failed
    }
    
    // Now open the unit management modal
    setShowUnitModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPropertyTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'house':
        return '🏠';
      case 'apartment':
        return '🏢';
      case 'studio':
        return '🏠';
      case 'commercial':
        return '🏢';
      default:
        return '🏠';
    }
  };

  const getAvailabilityBadge = (status) => {
    const badges = {
      available: 'badge-success',
      occupied: 'badge-danger',
      maintenance: 'badge-warning'
    };
    
    return badges[status?.toLowerCase()] || 'badge-info';
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) {
      onSave(property._id);
    }
  };

  return (
    <div className={`property-card group ${className}`}>
      {/* Image Container */}
      <div className="relative overflow-hidden h-48 bg-gray-200">
        {!imageError ? (
          <>
            <img
              src={property.images?.[0] || '/api/placeholder/400/300'}
              alt={property.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                isImageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setImageError(true);
                setIsImageLoading(false);
              }}
            />
            
            {/* Image Loading Placeholder */}
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                <CameraIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </>
        ) : (
          /* Image Error Placeholder */
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center text-gray-400">
              <CameraIcon className="h-12 w-12 mx-auto mb-2" />
              <span className="text-sm">No Image</span>
            </div>
          </div>
        )}

        {/* Overlay Elements */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Save Button */}
        {showSaveButton && (
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-200 group-hover:scale-110"
          >
            {isSaved ? (
              <HeartSolidIcon className="h-5 w-5 text-danger-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600 hover:text-danger-500" />
            )}
          </button>
        )}

        {/* 🆕 UPDATED UNIT MANAGEMENT BUTTON */}
        <button
          onClick={handleUnitManagement}
          disabled={enablingUnits}
          className="absolute top-12 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-200 group-hover:scale-110 disabled:opacity-50"
          title={property.hasUnits ? "Manage Units" : "Add Units to Property"}
        >
          <HomeIcon className="h-5 w-5 text-purple-600 hover:text-purple-700" />
          {enablingUnits && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            </div>
          )}
        </button>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`${getAvailabilityBadge(property.availability)} capitalize`}>
            {property.availability || 'Available'}
          </span>
        </div>

        {/* Image Count */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <CameraIcon className="h-3 w-3" />
            <span>{property.images.length}</span>
          </div>
        )}

        {/* Featured Badge */}
        {property.featured && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-accent-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {property.title}
            </h3>
            <div className="ml-2 text-xs text-gray-500 flex items-center">
              {getPropertyTypeIcon(property.propertyType)}
              {/* 🆕 MULTI-UNIT BADGE */}
              {property.hasUnits && (
                <span className="ml-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                  Multi-unit
                </span>
              )}
            </div>
          </div>
          
          {/* Location */}
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">
              {property.location?.address || property.location?.city || 'Location not specified'}
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            {property.bedrooms && (
              <div className="flex items-center space-x-1">
                <HomeIcon className="h-4 w-4" />
                <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {property.bathrooms && (
              <div className="flex items-center space-x-1">
                <span>🚿</span>
                <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {property.area && (
              <div className="flex items-center space-x-1">
                <span>📐</span>
                <span>{property.area} m²</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {property.description}
          </p>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(property.rent || property.price)}
              </span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            
            {property.deposit && (
              <div className="text-xs text-gray-500 mt-1">
                Deposit: {formatPrice(property.deposit)}
              </div>
            )}
          </div>

          {/* View Button */}
          <Link
            to={`/properties/${property._id}`}
            className="btn-primary btn-sm px-4 py-2"
          >
            View Details
          </Link>
        </div>

        {/* 🆕 ADD VISIBLE "ADD UNITS" BUTTON */}
        <div className="mt-4">
          <button
            onClick={handleUnitManagement}
            disabled={enablingUnits}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white font-semibold bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400"
          >
            {enablingUnits ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Enabling Units...</span>
              </>
            ) : (
              <>
                <HomeIcon className="h-5 w-5" />
                <span>{property.hasUnits ? "Manage Units" : "Add Units to This Property"}</span>
              </>
            )}
          </button>
          {!property.hasUnits && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Click to convert this property to multi-unit and add individual units
            </p>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-3 w-3" />
            <span>Listed {formatDate(property.createdAt || new Date())}</span>
          </div>
          
          {property.agent && (
            <div className="flex items-center space-x-1">
              <div className="h-5 w-5 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xs text-primary-600 font-medium">
                  {property.agent.firstName?.charAt(0) || 'A'}
                </span>
              </div>
              <span>{property.agent.firstName} {property.agent.lastName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Unit Management Modal */}
      {showUnitModal && (
        <UnitManagementModal
          propertyId={property._id}
          property={property} // 🆕 Make sure to pass the property object
          onClose={() => setShowUnitModal(false)}
          onUnitsAdded={() => {
            console.log('Units added successfully!');
            setShowUnitModal(false);
            // Refresh the property data
            if (onPropertyUpdate) {
              onPropertyUpdate();
            }
          }}
        />
      )}
    </div>
  );
};

export default PropertyCard;