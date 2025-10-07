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
import { FILTER_OPTIONS, PROPERTY_TYPES } from '../../utils/constants';

const PropertySearch = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedProperties, setSavedProperties] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  
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

  // Mock properties data - replace with API call
  const mockProperties = [
    {
      _id: '1',
      title: 'Modern 2BR Apartment in Westlands',
      description: 'Beautiful modern apartment with stunning city views. Features include a spacious living room, modern kitchen, and two comfortable bedrooms.',
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
      agent: {
        firstName: 'Jane',
        lastName: 'Doe'
      },
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      _id: '2',
      title: 'Spacious 3BR House in Karen',
      description: 'Family-friendly house in the serene Karen area. Perfect for families with children, featuring a large compound and modern amenities.',
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
      availability: 'available',
      featured: false,
      agent: {
        firstName: 'John',
        lastName: 'Smith'
      },
      createdAt: '2024-01-14T15:45:00Z'
    },
    {
      _id: '3',
      title: 'Studio Apartment in Kilimani',
      description: 'Compact and efficient studio apartment perfect for young professionals. Located in the heart of Kilimani with easy access to amenities.',
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
      availability: 'available',
      featured: false,
      agent: {
        firstName: 'Mary',
        lastName: 'Johnson'
      },
      createdAt: '2024-01-13T09:20:00Z'
    }
  ];

  useEffect(() => {
    fetchProperties();
  }, [searchParams, currentPage]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Apply filters to mock data
      let filteredProperties = [...mockProperties];
      
      // Search query filter
      if (searchQuery) {
        filteredProperties = filteredProperties.filter(property =>
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.area.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Property type filter
      if (propertyType) {
        filteredProperties = filteredProperties.filter(property =>
          property.propertyType === propertyType
        );
      }
      
      // Location filter
      if (location) {
        filteredProperties = filteredProperties.filter(property =>
          property.location.city.toLowerCase() === location.toLowerCase() ||
          property.location.area.toLowerCase() === location.toLowerCase()
        );
      }
      
      // Price range filter
      if (minPrice) {
        filteredProperties = filteredProperties.filter(property =>
          property.rent >= parseInt(minPrice)
        );
      }
      
      if (maxPrice) {
        filteredProperties = filteredProperties.filter(property =>
          property.rent <= parseInt(maxPrice)
        );
      }
      
      // Bedrooms filter
      if (bedrooms) {
        const bedroomCount = parseInt(bedrooms);
        filteredProperties = filteredProperties.filter(property =>
          bedroomCount === 4 ? property.bedrooms >= 4 : property.bedrooms === bedroomCount
        );
      }
      
      // Features filter
      if (features.length > 0) {
        filteredProperties = filteredProperties.filter(property =>
          features.every(feature => property.features.includes(feature))
        );
      }
      
      // Sorting
      filteredProperties.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'rent':
            aValue = a.rent;
            bValue = b.rent;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'bedrooms':
            aValue = a.bedrooms;
            bValue = b.bedrooms;
            break;
          case 'area':
            aValue = a.area;
            bValue = b.area;
            break;
          default:
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      setProperties(filteredProperties);
      setTotalCount(filteredProperties.length);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

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
      // Call API to remove from saved properties
    } else {
      setSavedProperties(prev => [...prev, propertyId]);
      // Call API to save property
    }
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
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
              {/* Filter Toggle */}
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
              
              {/* View Mode */}
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
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 border-l border-gray-300 ${viewMode === 'map' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <MapIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-base py-8">
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

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Search: {searchQuery}
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.delete('q');
                        setSearchParams(params);
                      }}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {propertyType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                    Type: {propertyType}
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.delete('type');
                        setSearchParams(params);
                      }}
                      className="ml-2 text-secondary-600 hover:text-secondary-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {location && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                    Location: {location}
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.delete('location');
                        setSearchParams(params);
                      }}
                      className="ml-2 text-accent-600 hover:text-accent-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Price: {minPrice && `KES ${parseInt(minPrice).toLocaleString()}`}{minPrice && maxPrice && ' - '}{maxPrice && `KES ${parseInt(maxPrice).toLocaleString()}`}
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.delete('minPrice');
                        params.delete('maxPrice');
                        setSearchParams(params);
                      }}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid-properties' : 'space-y-6'}>
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
                    Try adjusting your search criteria or filters to find more properties.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="btn-primary"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'grid-properties' : 'space-y-6'}>
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

                {/* Pagination would go here */}
                {totalCount > pageSize && (
                  <div className="flex items-center justify-center mt-12">
                    <nav className="flex items-center space-x-2">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        Previous
                      </button>
                      <button className="px-4 py-2 bg-primary-500 text-white rounded-lg">
                        1
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        2
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        3
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;