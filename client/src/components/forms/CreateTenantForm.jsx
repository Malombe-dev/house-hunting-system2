// client/src/components/forms/CreateTenantForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  ClipboardDocumentIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { ButtonLoader } from '../common/LoadingSpinner';
import api from '../../services/api';

const CreateTenantForm = ({ onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [seekers, setSeekers] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingSeekers, setLoadingSeekers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertySearchTerm, setPropertySearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState('new');
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);
  const propertyDropdownRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm();

  const watchLeaseDuration = watch('leaseDuration');

  // Generate secure random password
  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Auto-generate password for new users
  useEffect(() => {
    if (selectedOption === 'new') {
      const newPassword = generatePassword();
      setGeneratedPassword(newPassword);
      setValue('password', newPassword);
      setPasswordCopied(false);
    } else {
      setGeneratedPassword('');
      setValue('password', '');
    }
  }, [selectedOption, setValue]);

  // Copy password to clipboard
  const copyPasswordToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy password:', err);
      alert('Failed to copy password to clipboard');
    }
  };

  // Safe string truncation function
  const truncateString = (str, length = 80) => {
    if (!str || typeof str !== 'string') return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  };

  // Format location object to string
  const formatLocation = (location) => {
    if (!location) return 'Location not specified';
    
    if (typeof location === 'string') return location;
    
    if (typeof location === 'object') {
      const parts = [];
      if (location.street) parts.push(location.street);
      if (location.city) parts.push(location.city);
      if (location.area) parts.push(location.area);
      if (location.county) parts.push(location.county);
      if (location.country) parts.push(location.country);
      
      return parts.length > 0 ? parts.join(', ') : 'Address details available';
    }
    
    return 'Location not specified';
  };

  // Fetch available properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await api.get('/properties?status=available');
        const propertiesData = response.data.properties || response.data || [];
        
        const sanitizedProperties = propertiesData.map(property => ({
          ...property,
          _id: property._id,
          name: property.title || 'Unnamed Property',
          address: formatLocation(property.location) || property.description || 'Address not specified',
          rentAmount: property.rent || property.rentAmount || 0,
          type: property.propertyType || 'unknown',
          status: property.availability || property.status || 'available',
          bedrooms: property.bedrooms || 1,
          bathrooms: property.bathrooms || 1,
          area: property.area || 0,
          description: property.description || ''
        }));
        
        setProperties(sanitizedProperties);
        setFilteredProperties(sanitizedProperties);
      } catch (error) {
        console.error('Fetch properties error:', error);
        setProperties([]);
        setFilteredProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  // Search seekers
  useEffect(() => {
    const searchSeekers = async () => {
      if (searchTerm.length < 2) {
        setSeekers([]);
        return;
      }

      setLoadingSeekers(true);
      try {
        const response = await api.get(`/users/seekers?search=${searchTerm}`);
        setSeekers(response.data.users || []);
      } catch (error) {
        console.error('Search seekers error:', error);
        setSeekers([]);
      } finally {
        setLoadingSeekers(false);
      }
    };

    const debounceTimer = setTimeout(searchSeekers, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Filter properties based on search
  useEffect(() => {
    if (propertySearchTerm) {
      const searchLower = propertySearchTerm.toLowerCase();
      const filtered = properties.filter(property => {
        const name = (property.name || '').toLowerCase();
        const address = (property.address || '').toLowerCase();
        const description = (property.description || '').toLowerCase();
        const rentAmount = (property.rentAmount || 0).toString();
        
        return (
          name.includes(searchLower) ||
          address.includes(searchLower) ||
          description.includes(searchLower) ||
          rentAmount.includes(propertySearchTerm)
        );
      });
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(properties);
    }
  }, [propertySearchTerm, properties]);

  // Calculate lease end date
  useEffect(() => {
    if (watchLeaseDuration && selectedProperty) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + parseInt(watchLeaseDuration));
      
      setValue('leaseStartDate', startDate.toISOString().split('T')[0]);
      setValue('leaseEndDate', endDate.toISOString().split('T')[0]);
      setValue('rentAmount', selectedProperty.rentAmount || 0);
      setValue('depositAmount', selectedProperty.rentAmount || 0);
    }
  }, [watchLeaseDuration, selectedProperty, setValue]);

  // Close property dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(event.target)) {
        setIsPropertyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSeekerSelect = (seeker) => {
    setSelectedSeeker(seeker);
    setValue('userId', seeker._id);
    setValue('firstName', seeker.firstName);
    setValue('lastName', seeker.lastName);
    setValue('email', seeker.email);
    setValue('phone', seeker.phone);
    setValue('idNumber', seeker.idNumber);
    setSearchTerm('');
    setSeekers([]);
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setValue('property', property._id);
    setValue('rentAmount', property.rentAmount || 0);
    setValue('depositAmount', property.rentAmount || 0);
    setPropertySearchTerm(`${property.name} - ${truncateString(property.address, 50)}`);
    setIsPropertyDropdownOpen(false);
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setSelectedSeeker(null);
    setSelectedProperty(null);
    setSearchTerm('');
    setPropertySearchTerm('');
    setSeekers([]);
    reset();
  };

  const clearPropertySelection = () => {
    setSelectedProperty(null);
    setPropertySearchTerm('');
    setValue('property', '');
    setValue('rentAmount', '');
    setValue('depositAmount', '');
    setIsPropertyDropdownOpen(true);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (!selectedProperty) {
        alert('Please select a property');
        setIsLoading(false);
        return;
      }
  
      let requestData = {
        property: data.property,
        moveInDate: data.moveInDate,
        rentAmount: parseFloat(data.rentAmount),
        depositAmount: parseFloat(data.depositAmount),
        leaseStartDate: data.leaseStartDate,
        leaseEndDate: data.leaseEndDate,
        leaseDuration: parseInt(data.leaseDuration),
        emergencyContact: {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relationship: data.emergencyContactRelationship
        }
      };
  
      if (data.occupation || data.employerName) {
        requestData.employmentInfo = {
          occupation: data.occupation,
          employerName: data.employerName,
          employerPhone: data.employerPhone
        };
      }
  
      if (data.referenceName || data.referencePhone) {
        requestData.references = [{
          name: data.referenceName,
          phone: data.referencePhone,
          relationship: data.referenceRelationship
        }];
      }
  
      if (selectedOption === 'existing' && data.userId) {
        requestData.userId = data.userId;
      } else {
        requestData.userData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          idNumber: data.idNumber,
          password: generatedPassword,
          mustChangePassword: true
        };
      }
  
      console.log('🚀 Sending request to /tenants endpoint...');
      console.log('📦 Request data:', JSON.stringify(requestData, null, 2));
      
      const response = await api.post('/tenants', requestData);
      
      // COMPREHENSIVE RESPONSE DEBUGGING - NO .data ACCESS NEEDED!
      console.log('='.repeat(50));
      console.log('🔍 RESPONSE ANALYSIS (After Interceptor)');
      console.log('='.repeat(50));
      
      console.log('📨 Response object exists:', !!response);
      console.log('📄 Response type:', typeof response);
      
      if (response) {
        console.log('🔑 Response keys:', Object.keys(response));
        console.log('📋 Response contents:', response);
        console.log('✅ Has success property:', 'success' in response);
        
        if ('success' in response) {
          console.log('🎯 Success value:', response.success);
          console.log('🔍 Success value type:', typeof response.success);
        } else {
          console.log('❌ Missing success property in response');
        }
        
        // Check for common alternative success indicators
        console.log('📨 Has message property:', 'message' in response);
        console.log('👤 Has tenant property:', 'tenant' in response);
        
        if (response.message) {
          console.log('💬 Message:', response.message);
        }
      } else {
        console.log('🚨 No response object received!');
      }
      console.log('='.repeat(50));
  
      // IMPROVED SUCCESS HANDLING - NO .data ACCESS!
      if (response) {
        // Check multiple success indicators
        const isSuccess = 
          response.success === true ||
          response.message?.includes('success') ||
          response.tenant !== undefined;
  
        if (isSuccess) {
          console.log('🎉 SUCCESS: Tenant creation successful!');
          const message = selectedOption === 'existing' 
            ? 'Seeker converted to tenant successfully!'
            : `Tenant account created successfully!\n\nLogin Credentials:\nEmail: ${data.email}\nPassword: ${generatedPassword}\n\n(Password copied to clipboard)`;
          
          if (selectedOption === 'new') {
            await navigator.clipboard.writeText(generatedPassword);
          }
          
          alert(message);
          onSuccess && onSuccess(response.tenant || response);
          return; // Exit early on success
        }
      }
  
      // If we reach here, handle non-success cases
      console.log('⚠️ Handling non-success response');
      
      // Since we don't have status codes (interceptor strips them), check response content
      if (response && (response.message || response.tenant)) {
        console.log('✅ Assuming success based on response content');
        const message = selectedOption === 'existing' 
          ? 'Seeker converted to tenant successfully!'
          : `Tenant account created successfully!\n\nLogin Credentials:\nEmail: ${data.email}\nPassword: ${generatedPassword}\n\n(Password copied to clipboard)`;
        
        if (selectedOption === 'new') {
          await navigator.clipboard.writeText(generatedPassword);
        }
        
        alert(message);
        onSuccess && onSuccess(response.tenant || response);
      } else {
        console.log('❌ No clear success indicator found');
        
        // If we have response but no clear success, show a generic message
        if (response) {
          const serverMessage = response.message || 'Request completed';
          alert(`${serverMessage}. Please verify tenant was created.`);
        } else {
          alert('Request completed with unexpected response. Please check if tenant was created.');
        }
      }
  
    } catch (error) {
      console.error('❌ CREATE TENANT ERROR:', error);
      console.log('='.repeat(50));
      console.log('🔍 ERROR ANALYSIS');
      console.log('='.repeat(50));
      
      if (error.response) {
        // Server responded with error status
        console.error('📡 Server error response:', error.response.status);
        console.error('📄 Error response data:', error.response.data);
        
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error ||
                            `Server error: ${error.response.status}`;
        alert(errorMessage);
        
      } else if (error.request) {
        // Request was made but no response received
        console.error('📡 No response received from server');
        alert('Network error: No response from server. Please check your connection.');
        
      } else {
        // Something else happened
        console.error('⚙️ Request setup error:', error.message);
        alert(`Request failed: ${error.message}`);
      }
      
      console.log('='.repeat(50));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Create Tenant Account
        </h2>
        <UserPlusIcon className="h-8 w-8 text-primary-500" />
      </div>

      {/* Selection Type */}
      <div className="mb-6">
        <label className="label-text block mb-3">Create tenant from:</label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => handleOptionChange('new')}
            className={`px-4 py-2 rounded-lg border ${
              selectedOption === 'new'
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            New User
          </button>
          <button
            type="button"
            onClick={() => handleOptionChange('existing')}
            className={`px-4 py-2 rounded-lg border ${
              selectedOption === 'existing'
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Existing Seeker
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Seeker Search Section */}
        {selectedOption === 'existing' && (
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Existing Seeker</h3>
            
            <div className="relative">
              <label className="label-text">Search Seekers</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Search by name or email..."
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              </div>

              {loadingSeekers && (
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              )}

              {seekers.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                  {seekers.map((seeker) => (
                    <div
                      key={seeker._id}
                      onClick={() => handleSeekerSelect(seeker)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{seeker.firstName} {seeker.lastName}</div>
                      <div className="text-sm text-gray-600">{seeker.email} • {seeker.phone}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedSeeker && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-800">
                    Selected: {selectedSeeker.firstName} {selectedSeeker.lastName}
                  </div>
                  <div className="text-sm text-green-600">
                    {selectedSeeker.email} • {selectedSeeker.phone}
                  </div>
                </div>
              )}

              <input type="hidden" {...register('userId')} />
            </div>
          </div>
        )}

        {/* Personal Information */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">First Name *</label>
              <input
                type="text"
                {...register('firstName', {
                  required: selectedOption === 'new' ? 'First name is required' : false,
                  minLength: { value: 2, message: 'Min 2 characters' }
                })}
                className={`input-field ${errors.firstName ? 'input-error' : ''}`}
                placeholder="John"
                disabled={selectedOption === 'existing' && selectedSeeker}
              />
              {errors.firstName && (
                <p className="error-text">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="label-text">Last Name *</label>
              <input
                type="text"
                {...register('lastName', {
                  required: selectedOption === 'new' ? 'Last name is required' : false,
                  minLength: { value: 2, message: 'Min 2 characters' }
                })}
                className={`input-field ${errors.lastName ? 'input-error' : ''}`}
                placeholder="Doe"
                disabled={selectedOption === 'existing' && selectedSeeker}
              />
              {errors.lastName && (
                <p className="error-text">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label-text">Email Address *</label>
              <input
                type="email"
                {...register('email', {
                  required: selectedOption === 'new' ? 'Email is required' : false,
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Invalid email'
                  }
                })}
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="tenant@example.com"
                disabled={selectedOption === 'existing' && selectedSeeker}
              />
              {errors.email && (
                <p className="error-text">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label-text">Phone Number *</label>
              <input
                type="tel"
                {...register('phone', {
                  required: selectedOption === 'new' ? 'Phone is required' : false,
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Invalid phone'
                  }
                })}
                className={`input-field ${errors.phone ? 'input-error' : ''}`}
                placeholder="+254712345678"
                disabled={selectedOption === 'existing' && selectedSeeker}
              />
              {errors.phone && (
                <p className="error-text">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="label-text">National ID / Passport Number *</label>
            <input
              type="text"
              {...register('idNumber', { 
                required: selectedOption === 'new' ? 'ID number is required' : false 
              })}
              className={`input-field ${errors.idNumber ? 'input-error' : ''}`}
              placeholder="12345678"
              disabled={selectedOption === 'existing' && selectedSeeker}
            />
            {errors.idNumber && (
              <p className="error-text">{errors.idNumber.message}</p>
            )}
          </div>
        </div>

        {/* Property Selection with Search */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Property & Lease Details</h3>
          
          <div className="relative" ref={propertyDropdownRef}>
            <label className="label-text">Select Property *</label>
            {loadingProperties ? (
              <p className="text-sm text-gray-500">Loading properties...</p>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={propertySearchTerm}
                    onChange={(e) => {
                      setPropertySearchTerm(e.target.value);
                      setIsPropertyDropdownOpen(true);
                    }}
                    onFocus={() => setIsPropertyDropdownOpen(true)}
                    placeholder="Search properties by name, address, or rent..."
                    className="input-field pl-10 pr-10"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  
                  {propertySearchTerm && (
                    <button
                      type="button"
                      onClick={clearPropertySelection}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  {filteredProperties.length} of {properties.length} properties found
                </p>

                {isPropertyDropdownOpen && filteredProperties.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProperties.map((property) => (
                      <div
                        key={property._id}
                        onClick={() => handlePropertySelect(property)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          selectedProperty?._id === property._id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{property.name}</div>
                        <div className="text-sm text-gray-600">
                          {truncateString(property.address, 80)}
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          KES {(property.rentAmount || 0).toLocaleString()}/month
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {property.type} • {property.bedrooms} bed • {property.bathrooms} bath • {property.area} sq ft
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isPropertyDropdownOpen && propertySearchTerm && filteredProperties.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="text-gray-500 text-center">No properties found matching "{propertySearchTerm}"</p>
                  </div>
                )}
              </div>
            )}

            {selectedProperty && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">Selected Property:</div>
                <div className="text-sm text-green-700">{selectedProperty.name}</div>
                <div className="text-sm text-green-600">
                  {truncateString(selectedProperty.address, 100)}
                </div>
                <div className="text-sm font-semibold text-green-800">
                  KES {(selectedProperty.rentAmount || 0).toLocaleString()}/month
                </div>
                <div className="text-xs text-green-600">
                  {selectedProperty.bedrooms} bed • {selectedProperty.bathrooms} bath • {selectedProperty.area} sq ft
                </div>
              </div>
            )}

            <input type="hidden" {...register('property', { required: 'Property is required' })} />
            {errors.property && !selectedProperty && (
              <p className="error-text mt-2">Please select a property</p>
            )}
          </div>

          {/* Lease Details */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="label-text">Move-In Date *</label>
              <input
                type="date"
                {...register('moveInDate', { required: 'Move-in date is required' })}
                className={`input-field ${errors.moveInDate ? 'input-error' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.moveInDate && (
                <p className="error-text">{errors.moveInDate.message}</p>
              )}
            </div>

            <div>
              <label className="label-text">Lease Duration (Months) *</label>
              <select
                {...register('leaseDuration', { 
                  required: 'Lease duration is required',
                  valueAsNumber: true
                })}
                className={`input-field ${errors.leaseDuration ? 'input-error' : ''}`}
              >
                <option value="">Select duration</option>
                <option value={6}>6 Months</option>
                <option value={12}>12 Months</option>
                <option value={24}>24 Months</option>
                <option value={36}>36 Months</option>
              </select>
              {errors.leaseDuration && (
                <p className="error-text">{errors.leaseDuration.message}</p>
              )}
            </div>

            <div>
              <label className="label-text">Rent Amount (KES) *</label>
              <input
                type="number"
                {...register('rentAmount', { 
                  required: 'Rent amount is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Rent must be greater than 0' }
                })}
                className={`input-field ${errors.rentAmount ? 'input-error' : ''}`}
                placeholder="15000"
              />
              {errors.rentAmount && (
                <p className="error-text">{errors.rentAmount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label-text">Lease Start Date *</label>
              <input
                type="date"
                {...register('leaseStartDate', { required: 'Lease start date is required' })}
                className={`input-field ${errors.leaseStartDate ? 'input-error' : ''}`}
              />
              {errors.leaseStartDate && (
                <p className="error-text">{errors.leaseStartDate.message}</p>
              )}
            </div>

            <div>
              <label className="label-text">Lease End Date *</label>
              <input
                type="date"
                {...register('leaseEndDate', { required: 'Lease end date is required' })}
                className={`input-field ${errors.leaseEndDate ? 'input-error' : ''}`}
              />
              {errors.leaseEndDate && (
                <p className="error-text">{errors.leaseEndDate.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="label-text">Security Deposit (KES) *</label>
            <input
              type="number"
              {...register('depositAmount', { 
                required: 'Deposit amount is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Deposit must be greater than 0' }
              })}
              className={`input-field ${errors.depositAmount ? 'input-error' : ''}`}
              placeholder="15000"
            />
            {errors.depositAmount && (
              <p className="error-text">{errors.depositAmount.message}</p>
            )}
          </div>
        </div>

        {/* Employment Information */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Employment Information</h3>
          
          <div>
            <label className="label-text">Occupation</label>
            <input
              type="text"
              {...register('occupation')}
              className="input-field"
              placeholder="e.g., Software Engineer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label-text">Employer Name</label>
              <input
                type="text"
                {...register('employerName')}
                className="input-field"
                placeholder="Company name"
              />
            </div>

            <div>
              <label className="label-text">Employer Phone</label>
              <input
                type="tel"
                {...register('employerPhone')}
                className="input-field"
                placeholder="+254700000000"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Contact Name *</label>
              <input
                type="text"
                {...register('emergencyContactName', { required: 'Emergency contact name is required' })}
                className={`input-field ${errors.emergencyContactName ? 'input-error' : ''}`}
                placeholder="Jane Doe"
              />
              {errors.emergencyContactName && (
                <p className="error-text">{errors.emergencyContactName.message}</p>
              )}
            </div>

            <div>
              <label className="label-text">Contact Phone *</label>
              <input
                type="tel"
                {...register('emergencyContactPhone', { required: 'Emergency contact phone is required' })}
                className={`input-field ${errors.emergencyContactPhone ? 'input-error' : ''}`}
                placeholder="+254700000000"
              />
              {errors.emergencyContactPhone && (
                <p className="error-text">{errors.emergencyContactPhone.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="label-text">Relationship *</label>
            <input
              type="text"
              {...register('emergencyContactRelationship', { required: 'Relationship is required' })}
              className={`input-field ${errors.emergencyContactRelationship ? 'input-error' : ''}`}
              placeholder="e.g., Spouse, Parent, Sibling"
            />
            {errors.emergencyContactRelationship && (
              <p className="error-text">{errors.emergencyContactRelationship.message}</p>
            )}
          </div>
        </div>

        {/* Reference */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Reference (Optional)</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Reference Name</label>
              <input
                type="text"
                {...register('referenceName')}
                className="input-field"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="label-text">Reference Phone</label>
              <input
                type="tel"
                {...register('referencePhone')}
                className="input-field"
                placeholder="+254700000000"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="label-text">Relationship</label>
            <input
              type="text"
              {...register('referenceRelationship')}
              className="input-field"
              placeholder="e.g., Friend, Colleague"
            />
          </div>
        </div>

        {/* Auto-Generated Password Display - Only for new users */}
        {selectedOption === 'new' && generatedPassword && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
              <span className="mr-2">🔐</span>
              Auto-Generated Login Password
            </h3>
            
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Temporary Password:</label>
                <button
                  type="button"
                  onClick={copyPasswordToClipboard}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                    passwordCopied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {passwordCopied ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      <span className="text-sm">Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="h-4 w-4" />
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 font-mono text-lg text-gray-900 break-all">
                {generatedPassword}
              </div>
              
              <input type="hidden" {...register('password')} value={generatedPassword} />
            </div>

            <div className="mt-3 space-y-2">
              <p className="text-sm text-yellow-800 flex items-start">
                <span className="mr-2">⚠️</span>
                <span>
                  <strong>Important:</strong> Make sure to copy this password before submitting. 
                  The tenant will use this password for their first login.
                </span>
              </p>
              <p className="text-sm text-yellow-700 flex items-start">
                <span className="mr-2">🔄</span>
                <span>
                  The tenant will be required to change this password on their first login for security.
                </span>
              </p>
              <p className="text-sm text-yellow-700 flex items-start">
                <span className="mr-2">📧</span>
                <span>
                  Login Email: <strong>{watch('email') || 'Not entered yet'}</strong>
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <ButtonLoader text={selectedOption === 'existing' ? 'Converting...' : 'Creating...'} />
            ) : (
              selectedOption === 'existing' ? 'Convert to Tenant' : 'Create Tenant Account'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTenantForm;