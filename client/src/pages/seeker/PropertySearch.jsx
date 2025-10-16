import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PropertyCard from '../../components/cards/PropertyCard';
import SearchBar from '../../components/filters/SearchBar';
import PropertyFilters from '../../components/filters/PropertyFilter';
import SortOptions from '../../components/filters/SortOPtions';
import LoadingSpinner, { CardLoader } from '../../components/common/LoadingSpinner';
import { 
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  MapIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const PropertySearch = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedProperties, setSavedProperties] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [error, setError] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Extract search parameters
  const searchQuery = searchParams.get('q') || '';
  const propertyType = searchParams.get('type') || '';
  const location = searchParams.get('location') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const bathrooms = searchParams.get('bathrooms') || '';
  const features = searchParams.get('features')?.split(',').filter(Boolean) || [];
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  // Build API query parameters
  const buildApiParams = () => {
    const params = new URLSearchParams();
    
    // Basic search parameters
    if (searchQuery) params.set('q', searchQuery);
    if (propertyType) params.set('propertyType', propertyType);
    if (location) params.set('location', location);
    
    // Price range
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    
    // Basic filters
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);
    
    // Features
    if (features.length > 0) params.set('features', features.join(','));
    
    // Sorting
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    
    // Pagination
    params.set('page', currentPage.toString());
    params.set('limit', pageSize.toString());
    
    return params;
  };

  // Fetch properties from API
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiParams = buildApiParams();
      const url = `http://localhost:5000/api/properties?${apiParams.toString()}`;
      
      console.log('🔍 Fetching properties from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ API Response:', result);
      
      // ✅ FIXED: Handle the correct response structure
      // Your API returns: { status: "success", data: { properties: [], pagination: {} } }
      if (result.status === "success") {
        if (result.data && Array.isArray(result.data.properties)) {
          setProperties(result.data.properties);
          setTotalCount(result.data.pagination?.total || result.data.properties.length);
        } else {
          // Fallback if properties array is in different location
          setProperties(result.data || []);
          setTotalCount(result.data?.length || 0);
        }
      } else {
        throw new Error(result.message || 'API returned unsuccessful status');
      }
    } catch (error) {
      console.error('❌ Error fetching properties:', error);
      setError(error.message);
      setProperties([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchParams, currentPage]);

  const handleSearch = (searchData) => {
    const params = new URLSearchParams();
    
    if (searchData.query) params.set('q', searchData.query);
    if (searchData.type) params.set('type', searchData.type);
    if (searchData.location) params.set('location', searchData.location);
    
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handleFilterChange = (filters) => {
    const params = new URLSearchParams(searchParams);
    
    // Update all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (!Array.isArray(value)) {
          params.set(key, value);
        }
      } else {
        params.delete(key);
      }
    });
    
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', newSortBy);
    params.set('sortOrder', newSortOrder);
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handleSaveProperty = (propertyId) => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: '/properties' } });
      return;
    }
    
    if (savedProperties.includes(propertyId)) {
      setSavedProperties(prev => prev.filter(id => id !== propertyId));
    } else {
      setSavedProperties(prev => [...prev, propertyId]);
    }
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

  const retryFetch = () => {
    fetchProperties();
  };

  const hasActiveFilters = searchQuery || propertyType || location || minPrice || maxPrice || bedrooms || bathrooms || features.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="container-base py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <SearchBar
                initialQuery={searchQuery}
                initialType={propertyType}
                initialLocation={location}
                onSearch={handleSearch}
                compact
              />
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                )}
              </button>
              
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <ViewColumnsIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-base py-8">
        {/* Error Message with Retry */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XMarkIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading properties
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {error}
                  </p>
                </div>
              </div>
              <button
                onClick={retryFetch}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                <PropertyFilters
                  onFilterChange={handleFilterChange}
                  initialFilters={{
                    minPrice,
                    maxPrice,
                    bedrooms,
                    bathrooms,
                    features,
                    propertyType,
                    location
                  }}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchQuery ? `Search results for "${searchQuery}"` : 'All Properties'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {loading ? 'Searching...' : `${totalCount.toLocaleString()} properties found`}
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <SortOptions
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSortChange={handleSortChange}
                />
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <CardLoader key={index} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <AdjustmentsHorizontalIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No properties found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {error ? 'Unable to load properties from server.' : 'Try adjusting your search criteria to find more properties.'}
                  </p>
                  {error && (
                    <button
                      onClick={retryFetch}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                {properties.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    onSave={handleSaveProperty}
                    isSaved={savedProperties.includes(property._id)}
                    showSaveButton={isAuthenticated}
                    className={viewMode === 'list' ? 'flex flex-row h-48' : ''}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;