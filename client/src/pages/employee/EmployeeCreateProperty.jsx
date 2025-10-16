// File: client/src/pages/employee/EmployeeCreateProperty.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyForm from '../../components/forms/PropertyForm';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EmployeeCreateProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
    
    // Dynamic fields
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
    
    // Images
    if (data.images && data.images.length > 0) {
      data.images.forEach(file => {
        formData.append('images', file);
      });
    }
    
    return formData;
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    
    try {
      const data = createFormData(formData);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create property');
      }
      
      const result = await response.json();
      
      alert('Property created successfully! It will be visible after approval by an agent.');
      
      // Redirect to employee properties list
      navigate('/employee/properties');
      
    } catch (error) {
      console.error('Error creating property:', error);
      alert(error.message || 'Failed to create property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All entered information will be lost.')) {
      navigate('/employee/properties');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/employee/properties')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Properties
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Property</h1>
            <p className="mt-2 text-gray-600">
              Add a new property. Fill in all required fields marked with *.
            </p>
          </div>

          {/* Approval Notice */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Approval Required</h3>
                <p className="text-yellow-700 mt-1">
                  Properties you create will require approval from an agent before being published. 
                  Your property will be reviewed within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Property Form */}
        <PropertyForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default EmployeeCreateProperty;