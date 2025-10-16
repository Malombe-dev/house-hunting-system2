import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropertyForm from '../../components/forms/PropertyForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Property not found');
          }
          if (response.status === 403) {
            throw new Error('You do not have permission to edit this property');
          }
          throw new Error('Failed to fetch property');
        }

        const data = await response.json();
        
        if (data.status === 'success') {
          setProperty(data.data.property);
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

    if (id) {
      fetchProperty();
    }
  }, [id]);

  // Helper function to create FormData
  const createFormData = (data) => {
    const formData = new FormData();
    
    // Basic fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('propertyType', data.propertyType);
    
    // Pricing
    if (data.rent) formData.append('rent', data.rent);
    if (data.price) formData.append('price', data.price);
    if (data.deposit) formData.append('deposit', data.deposit);
    if (data.priceType) formData.append('priceType', data.priceType);
    
    // Property details
    formData.append('bedrooms', data.bedrooms);
    formData.append('bathrooms', data.bathrooms);
    formData.append('area', data.area);
    
    // Dynamic fields based on property type
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
    
    // Location
    formData.append('location[address]', data.location.address);
    formData.append('location[city]', data.location.city);
    formData.append('location[area]', data.location.area);
    formData.append('location[coordinates][latitude]', data.location.coordinates.latitude);
    formData.append('location[coordinates][longitude]', data.location.coordinates.longitude);
    
    // Features
    formData.append('features', JSON.stringify(data.features));
    
    // Boolean fields
    formData.append('furnished', data.furnished);
    formData.append('petsAllowed', data.petsAllowed);
    formData.append('smokingAllowed', data.smokingAllowed);
    
    // NEW image files
    if (data.images && data.images.length > 0) {
      data.images.forEach(file => {
        formData.append('images', file);
      });
    }
    
    // Existing images (URLs)
    if (data.existingImages && data.existingImages.length > 0) {
      formData.append('existingImages', JSON.stringify(data.existingImages));
    }
    
    return formData;
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    setSubmitting(true);

    try {
      const data = createFormData(formData);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update property');
      }

      const result = await response.json();
      
      alert('Property updated successfully!');
      
      // Redirect to property details or management page
      navigate(`/agent/properties`);
      
    } catch (error) {
      console.error('Error updating property:', error);
      alert(error.message || 'Failed to update property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate(-1);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading property..." />
      </div>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              {error === 'Property not found' ? 'Property Not Found' : 'Error Loading Property'}
            </h2>
            <p className="text-red-700">
              {error || "Unable to load property data."}
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go Back
            </button>
            <button
              onClick={() => navigate('/agent/properties')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View All Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
              <p className="mt-2 text-gray-600">
                Update property information for "{property.title}"
              </p>
            </div>
            
            {/* Property Status Badges */}
            <div className="flex flex-col gap-2">
              {property.approvalStatus === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ Pending Approval
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Changes may require re-approval
                  </p>
                </div>
              )}
              
              {property.approvalStatus === 'rejected' && property.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  <p className="text-sm text-red-800 font-medium">
                    ❌ Rejected
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Reason: {property.rejectionReason}
                  </p>
                </div>
              )}
              
              {property.availability === 'occupied' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <p className="text-sm text-blue-800 font-medium">
                    🏠 Currently Occupied
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Property Form */}
        <PropertyForm 
          property={property}
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          loading={submitting}
        />
      </div>
    </div>
  );
};

export default EditProperty;