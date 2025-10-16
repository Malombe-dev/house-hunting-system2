import React, { useState, useCallback, useEffect, useRef } from 'react';

// Complete Property type configuration with all 16 types
const PROPERTY_TYPE_CONFIG = {
  // Residential Types
  apartment: {
    label: 'Apartment',
    description: 'Self-contained unit in a multi-story building',
    fields: ['floor', 'buildingName'],
    showBedrooms: true,
    showBathrooms: true,
    showRent: true
  },
  house: {
    label: 'House',
    description: 'Standalone residential building',
    fields: ['plotSize', 'compound'],
    showBedrooms: true,
    showBathrooms: true,
    showRent: true
  },
  bedsitter: {
    label: 'Bedsitter',
    description: 'Single room with combined living, sleeping, and kitchen area',
    fields: ['sharedBathroom'],
    showBedrooms: false,
    showBathrooms: true,
    showRent: true
  },
  single_room: {
    label: 'Single Room',
    description: 'Basic room with shared facilities',
    fields: ['sharedBathroom', 'sharedKitchen'],
    showBedrooms: false,
    showBathrooms: false,
    showRent: true
  },
  studio: {
    label: 'Studio',
    description: 'Open-plan living space with separate bathroom',
    fields: ['floor'],
    showBedrooms: false,
    showBathrooms: true,
    showRent: true
  },
  bungalow: {
    label: 'Bungalow',
    description: 'Single-story standalone house',
    fields: ['plotSize', 'compound'],
    showBedrooms: true,
    showBathrooms: true,
    showRent: true
  },
  maisonette: {
    label: 'Maisonette',
    description: 'Multi-story standalone house',
    fields: ['plotSize', 'compound', 'floors'],
    showBedrooms: true,
    showBathrooms: true,
    showRent: true
  },
  
  // Commercial Types
  commercial: {
    label: 'Commercial Space',
    description: 'General commercial premises',
    fields: ['businessType', 'floorArea'],
    showBedrooms: false,
    showBathrooms: true,
    showRent: true
  },
  office_space: {
    label: 'Office Space',
    description: 'Dedicated office premises',
    fields: ['floor', 'officeType', 'receptionArea'],
    showBedrooms: false,
    showBathrooms: true,
    showRent: true
  },
  shop: {
    label: 'Shop',
    description: 'Retail shop space',
    fields: ['shopType', 'displayWindows', 'storageRoom'],
    showBedrooms: false,
    showBathrooms: true,
    showRent: true
  },
  warehouse: {
    label: 'Warehouse',
    description: 'Storage and industrial space',
    fields: ['warehouseType', 'loadingBay', 'ceilingHeight'],
    showBedrooms: false,
    showBathrooms: true,
    showRent: true
  },
  
  // Special Types
  hostel: {
    label: 'Hostel',
    description: 'Shared accommodation with common facilities',
    fields: ['sharedFacilities', 'roomsCount', 'commonAreas'],
    showBedrooms: false,
    showBathrooms: false,
    showRent: true
  },
  service_apartment: {
    label: 'Service Apartment',
    description: 'Furnished apartment with hotel-like services',
    fields: ['servicesIncluded', 'furnished'],
    showBedrooms: true,
    showBathrooms: true,
    showRent: true
  },
  
  // Land Types
  land: {
    label: 'Land',
    description: 'General land plot',
    fields: ['landSize', 'zoning', 'topography'],
    showBedrooms: false,
    showBathrooms: false,
    showRent: false
  },
  plot: {
    label: 'Plot',
    description: 'Empty land for development',
    fields: ['plotSize', 'zoning', 'utilities'],
    showBedrooms: false,
    showBathrooms: false,
    showRent: false
  },
  farm: {
    label: 'Farm',
    description: 'Agricultural land',
    fields: ['farmSize', 'farmType', 'waterSource'],
    showBedrooms: false,
    showBathrooms: false,
    showRent: false
  }
};

const KENYA_LOCATIONS = {
  COUNTIES: [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
    'Machakos', 'Meru', 'Nyeri', 'Garissa', 'Kakamega', 'Malindi'
  ]
};

const PROPERTY_FEATURES = [
  'parking', 'garden', 'swimming_pool', 'gym', 'security',
  'elevator', 'balcony', 'furnished', 'air_conditioning',
  'internet', 'water_backup', 'generator'
];

const LAND_FEATURES = [
  'fenced', 'water_connection', 'electricity', 'road_access',
  'title_deed', 'near_tarmac', 'agricultural', 'residential_zoning',
  'commercial_zoning', 'water_source', 'fertile_soil', 'irrigation'
];

const PropertyForm = ({ 
  property = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {

  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    propertyType: property?.propertyType || 'apartment',
    rent: property?.rent || '',
    price: property?.price || '',
    deposit: property?.deposit || '',
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    area: property?.area || '',
    location: {
      address: property?.location?.address || '',
      city: property?.location?.city || 'nairobi',
      area: property?.location?.area || '',
      coordinates: {
        latitude: property?.location?.coordinates?.latitude || -1.2921,
        longitude: property?.location?.coordinates?.longitude || 36.8219
      }
    },
    features: property?.features || [],
    furnished: property?.furnished || false,
    petsAllowed: property?.petsAllowed || false,
    smokingAllowed: property?.smokingAllowed || false
  });

  const [errors, setErrors] = useState({});
  const [uploadedImages, setUploadedImages] = useState(property?.images || []);
  const [imageFiles, setImageFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [mapLocation, setMapLocation] = useState({
    lat: property?.location?.coordinates?.latitude || -1.2921,
    lng: property?.location?.coordinates?.longitude || 36.8219
  });
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  const currentPropertyConfig = PROPERTY_TYPE_CONFIG[formData.propertyType];
  const isLandType = ['land', 'plot', 'farm'].includes(formData.propertyType);

  const updateFormField = (field, value) => {
    const fields = field.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < fields.length - 1; i++) {
        current[fields[i]] = { ...current[fields[i]] };
        current = current[fields[i]];
      }
      
      current[fields[fields.length - 1]] = value;
      return newData;
    });
  };

  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current || mapRef.current || !window.L) return;

    try {
      const map = window.L.map(mapContainerRef.current).setView(
        [mapLocation.lat, mapLocation.lng], 
        15
      );

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      const marker = window.L.marker([mapLocation.lat, mapLocation.lng], {
        draggable: true
      }).addTo(map);

      marker.on('dragend', (e) => {
        const position = e.target.getLatLng();
        setMapLocation({ lat: position.lat, lng: position.lng });
        updateFormField('location.coordinates.latitude', position.lat);
        updateFormField('location.coordinates.longitude', position.lng);
        reverseGeocode(position.lat, position.lng);
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setMapLocation({ lat, lng });
        updateFormField('location.coordinates.latitude', lat);
        updateFormField('location.coordinates.longitude', lng);
        reverseGeocode(lat, lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setMapInitialized(true);
    } catch (error) {
      console.error('Map initialization error:', error);
    }
  }, [mapLocation]);

  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        setTimeout(initializeMap, 100);
      };
    } else {
      initializeMap();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current && mapInitialized) {
      mapRef.current.setView([mapLocation.lat, mapLocation.lng], 15);
      markerRef.current.setLatLng([mapLocation.lat, mapLocation.lng]);
    }
  }, [mapLocation, mapInitialized]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PropertyManagementApp/1.0'
          }
        }
      );
      const data = await response.json();
      
      if (data.display_name) {
        updateFormField('location.address', data.display_name);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleAddressSearch = async () => {
    const address = formData.location.address;
    if (!address) return;

    setSearchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Kenya')}&limit=1`,
        {
          headers: {
            'User-Agent': 'PropertyManagementApp/1.0'
          }
        }
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLocation = { lat: parseFloat(lat), lng: parseFloat(lon) };
        
        setMapLocation(newLocation);
        updateFormField('location.coordinates.latitude', newLocation.lat);
        updateFormField('location.coordinates.longitude', newLocation.lng);
        
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([newLocation.lat, newLocation.lng], 15);
          markerRef.current.setLatLng([newLocation.lat, newLocation.lng]);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setSearchingAddress(false);
    }
  };

  const handleImageUpload = useCallback((files) => {
    const newFiles = Array.from(files).slice(0, 10 - uploadedImages.length);
    const newImageUrls = newFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    
    setImageFiles(prev => [...prev, ...newFiles]);
    setUploadedImages(prev => [...prev, ...newImageUrls]);
  }, [uploadedImages.length]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeImage = (index) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      if (newImages[index].url && newImages[index].file) {
        URL.revokeObjectURL(newImages[index].url);
      }
      newImages.splice(index, 1);
      return newImages;
    });
    setImageFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleFeatureToggle = (feature) => {
    const currentFeatures = formData.features;
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    updateFormField('features', newFeatures);
  };

  const formatFeatureName = (feature) => {
    return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title || formData.title.length < 10) {
      newErrors.title = 'Property title must be at least 10 characters';
    }
    
    if (!formData.description || formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    
    if (!formData.area || formData.area < (isLandType ? 0.01 : 10)) {
      newErrors.area = isLandType 
        ? 'Size must be at least 0.01 acres' 
        : 'Area must be at least 10 m²';
    }
    
    if (currentPropertyConfig?.showRent && (!formData.rent || formData.rent < 1000)) {
      newErrors.rent = 'Monthly rent must be at least KES 1,000';
    }
    
    if (isLandType && (!formData.price || formData.price < 10000)) {
      newErrors.price = 'Price must be at least KES 10,000';
    }
    
    if (!formData.location.address) {
      newErrors['location.address'] = 'Address is required';
    }
    
    if (!formData.location.city) {
      newErrors['location.city'] = 'City is required';
    }
    
    if (!formData.location.area) {
      newErrors['location.area'] = 'Area is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      images: imageFiles,
      existingImages: uploadedImages.filter(img => !img.file).map(img => img.url)
    };
    onSubmit(submitData);
  };

  const renderDynamicFields = () => {
    const fields = currentPropertyConfig?.fields || [];
    
    return fields.map(field => {
      switch (field) {
        case 'floor':
          return (
            <div key="floor">
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
              <input
                type="number"
                value={formData[field] || ''}
                onChange={(e) => updateFormField(field, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., 3"
                min="0"
              />
            </div>
          );
        
        case 'buildingName':
          return (
            <div key="buildingName">
              <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
              <input
                type="text"
                value={formData[field] || ''}
                onChange={(e) => updateFormField(field, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Westgate Apartments"
              />
            </div>
          );
        
        case 'plotSize':
        case 'landSize':
        case 'farmSize':
          return (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === 'plotSize' ? 'Plot Size' : field === 'landSize' ? 'Land Size' : 'Farm Size'} (acres)
              </label>
              <input
                type="number"
                value={formData[field] || ''}
                onChange={(e) => updateFormField(field, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., 0.25"
                step="0.01"
                min="0.01"
              />
            </div>
          );
        
        case 'compound':
          return (
            <div key="compound">
              <label className="block text-sm font-medium text-gray-700 mb-1">Compound Details</label>
              <input
                type="text"
                value={formData[field] || ''}
                onChange={(e) => updateFormField(field, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Shared compound, Private compound"
              />
            </div>
          );
        
        case 'floors':
          return (
            <div key="floors">
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
              <input
                type="number"
                value={formData[field] || ''}
                onChange={(e) => updateFormField(field, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., 2"
                min="1"
              />
            </div>
          );
        
        case 'sharedBathroom':
          return (
            <div key="sharedBathroom" className="flex items-center space-x-2 p-3">
              <input
                type="checkbox"
                checked={formData[field] || false}
                onChange={(e) => updateFormField(field, e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <label className="text-sm text-gray-700">Shared Bathroom</label>
            </div>
          );
        
        case 'sharedKitchen':
          return (
            <div key="sharedKitchen" className="flex items-center space-x-2 p-3">
              <input
                type="checkbox"
                checked={formData[field] || false}
                onChange={(e) => updateFormField(field, e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <label className="text-sm text-gray-700">Shared Kitchen</label>
            </div>
          );
        
        case 'businessType':
        case 'officeType':
        case 'shopType':
        case 'warehouseType':
        case 'farmType':
        case 'zoning':
        case 'topography':
        case 'utilities':
        case 'waterSource':
        case 'sharedFacilities':
        case 'commonAreas':
        case 'servicesIncluded':
          return (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{formatFeatureName(field)}</label>
              <input
                type="text"
                value={formData[field] || ''}
                onChange={(e) => updateFormField(field, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={`Enter ${formatFeatureName(field).toLowerCase()}`}
              />
            </div>
          );
        
        case 'floorArea':
        case 'ceilingHeight':
        case 'roomsCount':
          return (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formatFeatureName(field)} {field === 'ceilingHeight' && '(meters)'}
              </label>
              <input
                type="number"
                value={formData[field] || ''}
                onChange={(e) => updateFormField(field, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={field === 'roomsCount' ? 'e.g., 10' : 'e.g., 50'}
                min="1"
                step={field === 'ceilingHeight' ? '0.1' : '1'}
              />
            </div>
          );
        
        case 'receptionArea':
        case 'displayWindows':
        case 'storageRoom':
        case 'loadingBay':
          return (
            <div key={field} className="flex items-center space-x-2 p-3">
              <input
                type="checkbox"
                checked={formData[field] || false}
                onChange={(e) => updateFormField(field, e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <label className="text-sm text-gray-700">{formatFeatureName(field)}</label>
            </div>
          );
        
        default:
          return null;
      }
    });
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-8 max-w-6xl mx-auto p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Basic Information
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., Modern 2BR Apartment in Westlands"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Describe the property, its features, and what makes it special..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
            <select
              value={formData.propertyType}
              onChange={(e) => updateFormField('propertyType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <optgroup label="Residential">
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="bedsitter">Bedsitter</option>
                <option value="single_room">Single Room</option>
                <option value="studio">Studio</option>
                <option value="bungalow">Bungalow</option>
                <option value="maisonette">Maisonette</option>
              </optgroup>
              <optgroup label="Commercial">
                <option value="commercial">Commercial Space</option>
                <option value="office_space">Office Space</option>
                <option value="shop">Shop</option>
                <option value="warehouse">Warehouse</option>
              </optgroup>
              <optgroup label="Special">
                <option value="hostel">Hostel</option>
                <option value="service_apartment">Service Apartment</option>
              </optgroup>
              <optgroup label="Land">
                <option value="land">Land</option>
                <option value="plot">Plot</option>
                <option value="farm">Farm</option>
              </optgroup>
            </select>
            {currentPropertyConfig && (
              <p className="text-sm text-gray-600 mt-1">
                {currentPropertyConfig.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Property Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentPropertyConfig?.showBedrooms && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms *</label>
              <select
                value={formData.bedrooms}
                onChange={(e) => updateFormField('bedrooms', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value={0}>Studio</option>
                {[1,2,3,4,5,6].map(num => (
                  <option key={num} value={num}>{num} Bedroom{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          )}

          {currentPropertyConfig?.showBathrooms && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms *</label>
              <select
                value={formData.bathrooms}
                onChange={(e) => updateFormField('bathrooms', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {[1,2,3,4,5,6].map(num => (
                  <option key={num} value={num}>{num} Bathroom{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isLandType ? 'Size (acres) *' : 'Area (m²) *'}
            </label>
            <input
              type="number"
              value={formData.area}
              onChange={(e) => updateFormField('area', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${errors.area ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={isLandType ? "1.5" : "85"}
              step={isLandType ? "0.01" : "1"}
            />
            {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
          </div>

          {renderDynamicFields()}
        </div>
      </div>


      {currentPropertyConfig?.showRent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pricing</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (KES) *</label>
              <input
                type="number"
                value={formData.rent}
                onChange={(e) => updateFormField('rent', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg ${errors.rent ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="65000"
              />
              {errors.rent && <p className="mt-1 text-sm text-red-600">{errors.rent}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (KES)</label>
              <input
                type="number"
                value={formData.deposit}
                onChange={(e) => updateFormField('deposit', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={formData.rent ? (formData.rent * 2).toString() : '130000'}
              />
              <p className="text-sm text-gray-500 mt-1">
                Typically 1-2 months rent
              </p>
            </div>
          </div>
        </div>
      )}

      {isLandType && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pricing</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateFormField('price', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="5000000"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
              <select
                value={formData.priceType || 'total'}
                onChange={(e) => updateFormField('priceType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="total">Total Price</option>
                <option value="per_acre">Per Acre</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Location with OpenStreetMap
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) => updateFormField('location.address', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg ${errors['location.address'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g., Westlands Road, Building Name"
              />
              <button
                type="button"
                onClick={handleAddressSearch}
                disabled={searchingAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                {searchingAddress ? 'Searching...' : 'Find on Map'}
              </button>
            </div>
            {errors['location.address'] && <p className="mt-1 text-sm text-red-600">{errors['location.address']}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <select
                value={formData.location.city}
                onChange={(e) => updateFormField('location.city', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {KENYA_LOCATIONS.COUNTIES.map(county => (
                  <option key={county.toLowerCase()} value={county.toLowerCase()}>
                    {county}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area/Neighborhood *</label>
              <input
                type="text"
                value={formData.location.area}
                onChange={(e) => updateFormField('location.area', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg ${errors['location.area'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g., Westlands, Kilimani"
              />
              {errors['location.area'] && <p className="mt-1 text-sm text-red-600">{errors['location.area']}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pin Location on Map *</label>
            <div ref={mapContainerRef} className="h-64 rounded-lg border border-gray-300 overflow-hidden bg-gray-100"></div>
            <p className="text-sm text-gray-500 mt-2">
              Click on the map or drag the marker to set the exact location. Powered by OpenStreetMap.
            </p>
          </div>
        </div>
      </div>

      {!isLandType && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Features & Amenities</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {PROPERTY_FEATURES.map((feature) => (
              <label
                key={feature}
                className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{formatFeatureName(feature)}</span>
              </label>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.furnished}
                onChange={(e) => updateFormField('furnished', e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Furnished</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.petsAllowed}
                onChange={(e) => updateFormField('petsAllowed', e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Pets Allowed</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.smokingAllowed}
                onChange={(e) => updateFormField('smokingAllowed', e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Smoking Allowed</span>
            </label>
          </div>
        </div>
      )}

      {isLandType && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Land Features</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {LAND_FEATURES.map((feature) => (
              <label
                key={feature}
                className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{formatFeatureName(feature)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Property Images</h3>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-gray-600 mb-4">
            <p className="text-lg font-medium">Drop images here or click to upload</p>
            <p className="text-sm">Maximum 10 images, up to 5MB each</p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files)}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Select Images
          </label>
        </div>

        {uploadedImages.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Uploaded Images ({uploadedImages.length}/10)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={image.id || index} className="relative group">
                  <img
                    src={image.url || image}
                    alt={`Property ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Main
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              The first image will be used as the main photo.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-w-[120px]"
        >
          {loading ? 'Saving...' : (property ? 'Update Property' : 'Create Property')}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;