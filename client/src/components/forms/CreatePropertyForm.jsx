import React, { useState } from 'react';
import PropertyForm from './PropertyForm';
import { useNavigate } from 'react-router-dom';

const CreatePropertyForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ✅ DECLARE ALL FUNCTIONS AT THE TOP
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate(-1);
    }
  };

  // Helper function to create FormData for file upload
  const createFormData = (data) => {
    const formData = new FormData();
    
    // Append all text fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('propertyType', data.propertyType);
    
    // Append pricing
    if (data.rent) formData.append('rent', data.rent);
    if (data.price) formData.append('price', data.price);
    if (data.deposit) formData.append('deposit', data.deposit);
    if (data.priceType) formData.append('priceType', data.priceType);
    
    // Append property details
    formData.append('bedrooms', data.bedrooms);
    formData.append('bathrooms', data.bathrooms);
    formData.append('area', data.area);
    
    // Append dynamic fields
    const dynamicFields = [
      'floor', 'buildingName', 'plotSize', 'landSize', 'farmSize',
      'compound', 'floors', 'sharedBathroom', 'sharedKitchen',
      'businessType', 'floorArea', 'officeType', 'receptionArea',
      'shopType', 'displayWindows', 'storageRoom', 'warehouseType',
      'loadingBay', 'ceilingHeight', 'sharedFacilities', 'roomsCount',
      'commonAreas', 'servicesIncluded', 'zoning', 'topography',
      'utilities', 'farmType', 'waterSource'
    ];
    
    dynamicFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        formData.append(field, data[field]);
      }
    });
    
    // Append location
    formData.append('location[address]', data.location.address);
    formData.append('location[city]', data.location.city);
    formData.append('location[area]', data.location.area);
    formData.append('location[coordinates][latitude]', data.location.coordinates.latitude);
    formData.append('location[coordinates][longitude]', data.location.coordinates.longitude);
    
    // ✅ FIX: Handle features properly - they should be sent as individual form fields
    if (data.features && data.features.length > 0) {
      data.features.forEach((feature, index) => {
        formData.append(`features[${index}]`, feature);
      });
    }
    
    // Append boolean fields
    formData.append('furnished', data.furnished);
    formData.append('petsAllowed', data.petsAllowed);
    formData.append('smokingAllowed', data.smokingAllowed);
    
    // Append image files
    if (data.images && data.images.length > 0) {
      data.images.forEach((file, index) => {
        formData.append('images', file);
      });
    }
    
    // Append existing images if updating
    if (data.existingImages && data.existingImages.length > 0) {
      formData.append('existingImages', JSON.stringify(data.existingImages));
    }
    
    // ✅ DEBUG: Log what we're sending
    console.log('📤 Features being sent:', data.features);
    console.log('📤 Full form data structure:', {
      title: data.title,
      features: data.features,
      propertyType: data.propertyType
    });
    
    return formData;
  };

  // Handle API errors
  const handleApiError = (error) => {
    if (error.response) {
      return error.response.data?.message || 'Server error occurred';
    } else if (error.request) {
      return 'No response from server. Please check your connection.';
    } else {
      return error.message || 'An unexpected error occurred';
    }
  };

  // Submit handler - ✅ MOVE THIS BEFORE THE RETURN STATEMENT
  const handlePropertySubmit = async (data) => {
    console.log('📤 handlePropertySubmit called with:', data);
    setLoading(true);
    
    try {
      const formData = createFormData(data);
      
      // Get auth token
      const token = localStorage.getItem('token');
      
      // Make API request
      const response = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create property');
      }
      
      const result = await response.json();
      
      // Success!
      alert('Property created successfully!');
      console.log('Created property:', result.data.property);
      
      // Redirect to properties list or property detail
      navigate('/properties');
      
    } catch (error) {
      console.error('Error creating property:', error);
      alert(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD DEBUG LOG RIGHT BEFORE RENDERING
  console.log('🔍 CreatePropertyForm about to render PropertyForm with:', {
    onSubmit: handlePropertySubmit,
    onCancel: handleCancel,
    loading: loading
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Property</h1>
          <p className="mt-2 text-gray-600">
            Add a new property to your portfolio. Fill in all required fields marked with *.
          </p>
        </div>
        
        {/* ✅ These should now be properly defined */}
        <PropertyForm 
          onSubmit={handlePropertySubmit} 
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CreatePropertyForm;