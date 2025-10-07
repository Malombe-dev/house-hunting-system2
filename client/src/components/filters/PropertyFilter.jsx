import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { FILTER_OPTIONS, PROPERTY_TYPES, KENYA_LOCATIONS } from '../../utils/constants';

const PropertyFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    bedrooms: initialFilters.bedrooms || '',
    bathrooms: initialFilters.bathrooms || '',
    propertyType: initialFilters.propertyType || '',
    location: initialFilters.location || '',
    features: initialFilters.features || []
  });

  const [expandedSections, setExpandedSections] = useState({
    price: true,
    property: true,
    location: true,
    features: false
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900">Price Range</h3>
          {expandedSections.price ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.price && (
          <div className="mt-4 space-y-4">
            {/* Price Range Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="No limit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Quick Price Ranges */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Quick select:</p>
              <div className="grid grid-cols-2 gap-2">
                {FILTER_OPTIONS.PRICE_RANGES.map((range, index) => {
                  const isActive = 
                    parseInt(filters.minPrice || '0') === range.min && 
                    (range.max === null ? filters.maxPrice === '' : parseInt(filters.maxPrice || '0') === range.max);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        handleFilterChange('minPrice', range.min.toString());
                        handleFilterChange('maxPrice', range.max ? range.max.toString() : '');
                      }}
                      className={`p-2 text-xs rounded-lg border transition-colors ${
                        isActive
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection('property')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
          {expandedSections.property ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.property && (
          <div className="mt-4 space-y-4">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="">All Types</option>
                <option value={PROPERTY_TYPES.APARTMENT}>Apartment</option>
                <option value={PROPERTY_TYPES.HOUSE}>House</option>
                <option value={PROPERTY_TYPES.STUDIO}>Studio</option>
                <option value={PROPERTY_TYPES.COMMERCIAL}>Commercial</option>
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FILTER_OPTIONS.BEDROOMS.map((bedroom) => (
                  <button
                    key={bedroom.value}
                    onClick={() => handleFilterChange('bedrooms', 
                      filters.bedrooms === bedroom.value.toString() ? '' : bedroom.value.toString()
                    )}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      filters.bedrooms === bedroom.value.toString()
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {bedroom.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((bathroom) => (
                  <button
                    key={bathroom}
                    onClick={() => handleFilterChange('bathrooms', 
                      filters.bathrooms === bathroom.toString() ? '' : bathroom.toString()
                    )}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      filters.bathrooms === bathroom.toString()
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {bathroom}+
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection('location')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900">Location</h3>
          {expandedSections.location ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.location && (
          <div className="mt-4 space-y-4">
            {/* Location Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City/County
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="">All Locations</option>
                <optgroup label="Major Cities">
                  {KENYA_LOCATIONS.COUNTIES.slice(0, 5).map(county => (
                    <option key={county} value={county.toLowerCase()}>{county}</option>
                  ))}
                </optgroup>
                <optgroup label="Other Counties">
                  {KENYA_LOCATIONS.COUNTIES.slice(5).map(county => (
                    <option key={county} value={county.toLowerCase()}>{county}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Popular Locations */}
            {filters.location === 'nairobi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nairobi Areas
                </label>
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                  {KENYA_LOCATIONS.NAIROBI_AREAS.slice(0, 10).map(area => (
                    <button
                      key={area}
                      onClick={() => handleFilterChange('location', area.toLowerCase())}
                      className="p-1 text-xs text-left text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded"
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Features & Amenities */}
      <div>
        <button
          onClick={() => toggleSection('features')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900">Features & Amenities</h3>
          {expandedSections.features ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.features && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {FILTER_OPTIONS.PROPERTY_FEATURES.map((feature) => {
                const isSelected = filters.features.includes(feature);
                const featureLabel = feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                return (
                  <label
                    key={feature}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleFeatureToggle(feature)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{featureLabel}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Applied Filters Summary */}
      {Object.values(filters).some(value => 
        Array.isArray(value) ? value.length > 0 : value !== ''
      ) && (
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Applied Filters</h4>
            <button
              onClick={() => {
                const resetFilters = {
                  minPrice: '',
                  maxPrice: '',
                  bedrooms: '',
                  bathrooms: '',
                  propertyType: '',
                  location: '',
                  features: []
                };
                setFilters(resetFilters);
              }}
              className="text-xs text-primary-600 hover:text-primary-800 font-medium"
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            {(filters.minPrice || filters.maxPrice) && (
              <div className="text-gray-600">
                <span className="font-medium">Price:</span> 
                {filters.minPrice && ` From ${formatPrice(parseInt(filters.minPrice))}`}
                {filters.maxPrice && ` To ${formatPrice(parseInt(filters.maxPrice))}`}
              </div>
            )}
            
            {filters.bedrooms && (
              <div className="text-gray-600">
                <span className="font-medium">Bedrooms:</span> {filters.bedrooms === '0' ? 'Studio' : `${filters.bedrooms}+`}
              </div>
            )}
            
            {filters.bathrooms && (
              <div className="text-gray-600">
                <span className="font-medium">Bathrooms:</span> {filters.bathrooms}+
              </div>
            )}
            
            {filters.propertyType && (
              <div className="text-gray-600">
                <span className="font-medium">Type:</span> {filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1)}
              </div>
            )}
            
            {filters.location && (
              <div className="text-gray-600">
                <span className="font-medium">Location:</span> {filters.location.charAt(0).toUpperCase() + filters.location.slice(1)}
              </div>
            )}
            
            {filters.features.length > 0 && (
              <div className="text-gray-600">
                <span className="font-medium">Features:</span> {filters.features.length} selected
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;