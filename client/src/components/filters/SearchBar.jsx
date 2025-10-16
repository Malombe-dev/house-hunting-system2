import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SearchBar = ({ 
  initialQuery = '',
  initialType = '',
  initialLocation = '',
  onSearch,
  compact = false,
  className = ''
}) => {
  const [searchData, setSearchData] = useState({
    query: initialQuery,
    type: initialType,
    location: initialLocation
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Property type options
  const propertyTypes = [
    { value: '', label: 'Any Type' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'bedsitter', label: 'Bedsitter' },
    { value: 'single_room', label: 'Single Room' },
    { value: 'studio', label: 'Studio' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'maisonette', label: 'Maisonette' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'office_space', label: 'Office Space' },
    { value: 'shop', label: 'Shop' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'land', label: 'Land' },
    { value: 'plot', label: 'Plot' }
  ];

  // Popular locations in Kenya
  const popularLocations = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
    'Westlands', 'Kilimani', 'Karen', 'Lavington', 'Runda', 'Kileleshwa',
    'South B', 'South C', 'Embakasi', 'Eastleigh', 'Parklands'
  ];

  useEffect(() => {
    setSearchData({
      query: initialQuery,
      type: initialType,
      location: initialLocation
    });
  }, [initialQuery, initialType, initialLocation]);

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchData);
  };

  const clearSearch = () => {
    const clearedData = {
      query: '',
      type: '',
      location: ''
    };
    setSearchData(clearedData);
    onSearch(clearedData);
  };

  const hasActiveSearch = searchData.query || searchData.type || searchData.location;

  // Compact version for header/navbar
  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchData.query}
                onChange={(e) => handleInputChange('query', e.target.value)}
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-2 border-0 rounded-l-lg focus:outline-none focus:ring-0"
              />
            </div>

            {/* Location Input */}
            <div className="flex items-center border-l border-gray-300">
              <div className="absolute left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Location..."
                className="w-32 pl-8 pr-3 py-2 border-0 focus:outline-none focus:ring-0"
                list="locations"
              />
              <datalist id="locations">
                {popularLocations.map(location => (
                  <option key={location} value={location} />
                ))}
              </datalist>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-primary-600 text-white px-4 py-2 rounded-r-lg hover:bg-primary-700 transition-colors"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Clear button */}
        {hasActiveSearch && (
          <button
            onClick={clearSearch}
            className="absolute -right-2 -top-2 bg-gray-500 text-white rounded-full p-1 hover:bg-gray-600 transition-colors"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  // Full version for search page
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Query */}
          <div className="md:col-span-4">
            <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-1">
              What are you looking for?
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search-query"
                value={searchData.query}
                onChange={(e) => handleInputChange('query', e.target.value)}
                placeholder="e.g., 2 bedroom apartment, studio, land..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Property Type */}
          <div className="md:col-span-3">
            <label htmlFor="property-type" className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="property-type"
                value={searchData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white transition-colors"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="md:col-span-3">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                value={searchData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City or area..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                list="location-options"
              />
              <datalist id="location-options">
                {popularLocations.map(location => (
                  <option key={location} value={location} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Advanced Search Toggle */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center space-x-1"
          >
            <span>Advanced Search</span>
            <svg 
              className={`h-4 w-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {hasActiveSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center space-x-1"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Advanced Search Options */}
        {showAdvanced && (
          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (KES)</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (KES)</label>
              <input
                type="number"
                placeholder="Any"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3+</option>
              </select>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;