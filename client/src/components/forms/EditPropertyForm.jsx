import React, { useState, useEffect } from 'react';
import PropertyForm from './PropertyForm';
import { useNavigate, useParams } from 'react-router-dom';

const EditPropertyForm = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingProperty, setFetchingProperty] = useState(true);
  const [property, setProperty] = useState(null);

  // Fetch property data on mount
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch property');
        }
        
        const result = await response.json();
        setProperty(result.data.property);
      } catch (error) {
        console.error('Error fetching property:', error);
        alert('Failed to load property data');
        navigate('/properties');
      } finally {
        setFetchingProperty(false);
      }
    };
    
    fetchProperty();
  }, [propertyId, navigate]);

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
    
    // Append features as JSON
    formData.append('features', JSON.stringify(data.features));
    
    // Append boolean fields
    formData.append('furnished', data.furnished);
    formData.append('petsAllowed', data.petsAllowed);
    formData.append('smokingAllowed', data.smokingAllowed);
    
    // Append NEW image files
    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append('images', file);
      });
    }
    
    // Append existing images
    if (data.existingImages && data.existingImages.length > 0) {
      formData.append('existingImages', JSON.stringify(data.existingImages));
    }
    
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

  // Submit handler
  const handlePropertyUpdate = async (data) => {
    setLoading(true);
    
    try {
      const formData = createFormData(data);
      
      // Get auth token
      const token = localStorage.getItem('token');
      
      // Make API request
      const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update property');
      }
      
      const result = await response.json();
      
      // Success!
      alert('Property updated successfully!');
      console.log('Updated property:', result.data.property);
      
      // Redirect to property detail
      navigate(`/properties/${propertyId}`);
      
    } catch (error) {
      console.error('Error updating property:', error);
      alert(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Cancel handler
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate(`/properties/${propertyId}`);
    }
  };

  // Loading state
  if (fetchingProperty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Property not found</p>
          <button 
            onClick={() => navigate('/properties')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          <p className="mt-2 text-gray-600">
            Update property information. Changes will be saved immediately.
          </p>
          {property.approvalStatus === 'pending' && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ This property is pending approval. Changes may require re-approval.
              </p>
            </div>
          )}
        </div>
        
        <PropertyForm 
          property={property}
          onSubmit={handlePropertyUpdate} 
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default EditPropertyForm;