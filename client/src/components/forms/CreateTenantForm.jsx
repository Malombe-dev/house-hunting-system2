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

const CreateTenantForm = ({ onSuccess, onCancel, preSelectedProperty, preSelectedUnit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [seekers, setSeekers] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingSeekers, setLoadingSeekers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertySearchTerm, setPropertySearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState('new');
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
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
    
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
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

  // Initialize with pre-selected property and unit
  useEffect(() => {
    if (preSelectedProperty) {
      console.log('🎯 Pre-selected property:', preSelectedProperty);
      setSelectedProperty(preSelectedProperty);
      setValue('property', preSelectedProperty._id);
      
      const displayName = `${preSelectedProperty.title} - ${formatLocation(preSelectedProperty.location)}`;
      setPropertySearchTerm(displayName);
      
      if (preSelectedProperty.hasUnits) {
        fetchPropertyUnits(preSelectedProperty._id);
      } else {
        setValue('rentAmount', preSelectedProperty.rent || 0);
        setValue('depositAmount', preSelectedProperty.rent || 0);
      }
    }

    if (preSelectedUnit) {
      console.log('🎯 Pre-selected unit:', preSelectedUnit);
      setSelectedUnit(preSelectedUnit);
      setValue('unit', preSelectedUnit._id);
      setValue('rentAmount', preSelectedUnit.rent || 0);
      setValue('depositAmount', preSelectedUnit.deposit || preSelectedUnit.rent || 0);
    }
  }, [preSelectedProperty, preSelectedUnit, setValue]);

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

  const truncateString = (str, length = 80) => {
    if (!str || typeof str !== 'string') return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  };

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
  if (!preSelectedProperty) {
    const fetchProperties = async () => {
      try {
        console.log('🔍 Fetching available properties...');
        
        // Try multiple query variations to get properties
        let response;
        try {
          // First try with availability=available
          response = await api.get('/properties?availability=available');
        } catch (err) {
          console.log('⚠️ First query failed, trying alternate query...');
          // Fallback to status query
          response = await api.get('/properties?status=available');
        }
        
        console.log('📦 Properties response:', response);
        
        // Handle different response structures
        const propertiesData = response.properties || 
                              response.data?.properties || 
                              response.data || 
                              response || 
                              [];
        
        console.log(`✅ Found ${propertiesData.length} properties`);
        
        if (propertiesData.length === 0) {
          console.warn('⚠️ No properties found. Check backend /properties endpoint');
        }
        
        const sanitizedProperties = propertiesData.map(property => {
          const hasUnits = property.hasUnits === true || 
                          (property.units && property.units.length > 0);
          
          return {
            ...property,
            _id: property._id,
            name: property.title || property.name || 'Unnamed Property',
            address: formatLocation(property.location) || property.description || 'Address not specified',
            rentAmount: property.rent || property.rentAmount || 0,
            type: property.propertyType || property.type || 'unknown',
            status: property.availability || property.status || 'available',
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            area: property.area || 0,
            description: property.description || '',
            hasUnits: hasUnits
          };
        });
        
        console.log('🏠 Sanitized properties:', sanitizedProperties.map(p => ({
          name: p.name,
          hasUnits: p.hasUnits,
          unitsCount: p.units?.length || 0
        })));
        
        setProperties(sanitizedProperties);
        setFilteredProperties(sanitizedProperties);
        
      } catch (error) {
        console.error('❌ Fetch properties error:', error);
        console.error('Error details:', error.response?.data || error.message);
        
        // Show user-friendly error
        alert(`Failed to load properties: ${error.response?.data?.message || error.message}. Please refresh the page.`);
        
        setProperties([]);
        setFilteredProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  } else {
    setLoadingProperties(false);
  }
}, [preSelectedProperty]);

  // Fetch units for a property
  const fetchPropertyUnits = async (propertyId) => {
    setLoadingUnits(true);
    try {
      const response = await api.get(`/properties/${propertyId}/units`);
      const unitsData = response.data?.units || [];
      
      const availableUnits = unitsData.filter(unit => unit.availability === 'available');
      setUnits(availableUnits);
      
      console.log(`📦 Loaded ${availableUnits.length} available units for property`);
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

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
        setSeekers(response.users || []);
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
    if (propertySearchTerm && !preSelectedProperty) {
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
  }, [propertySearchTerm, properties, preSelectedProperty]);

  // Calculate lease end date
  useEffect(() => {
    if (watchLeaseDuration) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + parseInt(watchLeaseDuration));
      
      setValue('leaseStartDate', startDate.toISOString().split('T')[0]);
      setValue('leaseEndDate', endDate.toISOString().split('T')[0]);
      
      if (selectedUnit) {
        setValue('rentAmount', selectedUnit.rent || 0);
        setValue('depositAmount', selectedUnit.deposit || selectedUnit.rent || 0);
      } else if (selectedProperty && !selectedProperty.hasUnits) {
        setValue('rentAmount', selectedProperty.rentAmount || selectedProperty.rent || 0);
        setValue('depositAmount', selectedProperty.rentAmount || selectedProperty.rent || 0);
      }
    }
  }, [watchLeaseDuration, selectedProperty, selectedUnit, setValue]);

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

  const handlePropertySelect = async (property) => {
    setSelectedProperty(property);
    setValue('property', property._id);
    setPropertySearchTerm(`${property.name} - ${truncateString(property.address, 50)}`);
    setIsPropertyDropdownOpen(false);
    
    setSelectedUnit(null);
    setValue('unit', '');
    setUnits([]);
    
    if (property.hasUnits) {
      await fetchPropertyUnits(property._id);
    } else {
      setValue('rentAmount', property.rentAmount || 0);
      setValue('depositAmount', property.rentAmount || 0);
    }
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setValue('unit', unit._id);
    setValue('rentAmount', unit.rent || 0);
    setValue('depositAmount', unit.deposit || unit.rent || 0);
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setSelectedSeeker(null);
    if (!preSelectedProperty) {
      setSelectedProperty(null);
      setPropertySearchTerm('');
    }
    if (!preSelectedUnit) {
      setSelectedUnit(null);
    }
    setSearchTerm('');
    setSeekers([]);
    reset();
    
    if (preSelectedProperty) {
      setValue('property', preSelectedProperty._id);
      if (preSelectedUnit) {
        setValue('unit', preSelectedUnit._id);
        setValue('rentAmount', preSelectedUnit.rent || 0);
        setValue('depositAmount', preSelectedUnit.deposit || 0);
      }
    }
  };

  const clearPropertySelection = () => {
    if (!preSelectedProperty) {
      setSelectedProperty(null);
      setPropertySearchTerm('');
      setValue('property', '');
      setSelectedUnit(null);
      setUnits([]);
    }
    setValue('unit', '');
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

      if (selectedProperty.hasUnits && !selectedUnit) {
        alert('Please select a unit for this property');
        setIsLoading(false);
        return;
      }
  
      // Step 1: Create tenant account
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

      if (selectedUnit) {
        requestData.unit = data.unit;
      }
  
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
  
      console.log('🚀 Step 1: Creating tenant account...');
      const tenantResponse = await api.post('/tenants', requestData);
      
      console.log('✅ Tenant created:', tenantResponse);

      // Step 2: If unit selected, mark it as occupied
      if (selectedUnit && tenantResponse.tenant) {
        try {
          console.log('🏠 Step 2: Occupying unit...');
          const occupyData = {
            tenantId: tenantResponse.tenant.userId || tenantResponse.tenant._id,
            leaseStart: data.leaseStartDate,
            leaseEnd: data.leaseEndDate
          };

          await api.patch(
            `/properties/${selectedProperty._id}/units/${selectedUnit._id}/occupy`,
            occupyData
          );
          
          console.log('✅ Unit marked as occupied');
        } catch (occupyError) {
          console.error('⚠️ Warning: Tenant created but unit occupation failed:', occupyError);
          // Continue - tenant was created successfully
        }
      }

      // Success!
      const unitInfo = selectedUnit ? ` - Unit ${selectedUnit.unitNumber}` : '';
      const message = selectedOption === 'existing' 
        ? `Seeker converted to tenant successfully!${unitInfo}`
        : `Tenant account created successfully!${unitInfo}\n\nLogin Credentials:\nEmail: ${data.email}\nPassword: ${generatedPassword}\n\n(Password copied to clipboard)`;
      
      if (selectedOption === 'new') {
        await navigator.clipboard.writeText(generatedPassword);
      }
      
      alert(message);
      onSuccess && onSuccess(tenantResponse.tenant || tenantResponse);
  
    } catch (error) {
      console.error('❌ CREATE TENANT ERROR:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error ||
                            `Server error: ${error.response.status}`;
        alert(errorMessage);
      } else if (error.request) {
        alert('Network error: No response from server. Please check your connection.');
      } else {
        alert(`Request failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {preSelectedProperty ? `Create Tenant - ${preSelectedProperty.title}` : 'Create Tenant Account'}
          {preSelectedUnit && <span className="text-lg text-gray-600 ml-2">(Unit {preSelectedUnit.unitNumber})</span>}
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

        {/* Property & Unit Selection */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Property & Lease Details</h3>
          
          {/* Property Selection - Only show if not pre-selected */}
          {!preSelectedProperty ? (
            <div className="relative mb-4" ref={propertyDropdownRef}>
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
        className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
          selectedProperty?._id === property._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="font-medium text-gray-900">
            {property.name}
          </div>
          <div className="flex items-center space-x-2">
            {property.hasUnits ? (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                {property.units?.length || 'Multiple'} Units
              </span>
            ) : (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                Single Property
              </span>
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-1">
          📍 {truncateString(property.address, 80)}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 capitalize flex items-center space-x-2">
            <span>{property.type}</span>
            {property.bedrooms > 0 && (
              <>
                <span>•</span>
                <span>🛏️ {property.bedrooms} bed</span>
              </>
            )}
            {property.bathrooms > 0 && (
              <>
                <span>•</span>
                <span>🚿 {property.bathrooms} bath</span>
              </>
            )}
          </div>
          
          {!property.hasUnits && property.rentAmount > 0 && (
            <div className="text-sm font-semibold text-green-600">
              KES {property.rentAmount.toLocaleString()}/mo
            </div>
          )}
        </div>
        
        {property.hasUnits && (
          <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            💡 Select this property to view available units
          </div>
        )}
      </div>
    ))}
  </div>
)}

{/* Empty State with Help Text */}
{isPropertyDropdownOpen && propertySearchTerm && filteredProperties.length === 0 && (
  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
    <div className="text-center">
      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p className="text-gray-500">No properties found matching "{propertySearchTerm}"</p>
      <p className="text-xs text-gray-400 mt-1">Try a different search term or clear the search</p>
    </div>
  </div>
)}

{/* No Properties Loaded State */}
{!loadingProperties && !isPropertyDropdownOpen && properties.length === 0 && (
  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
    <p className="text-sm text-yellow-800">
      ⚠️ No properties available. Please add properties before creating tenants.
    </p>
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
                  {!selectedProperty.hasUnits && (
                    <div className="text-sm font-semibold text-green-800">
                      KES {(selectedProperty.rentAmount || 0).toLocaleString()}/month
                    </div>
                  )}
                </div>
              )}

              <input type="hidden" {...register('property', { required: 'Property is required' })} />
              {errors.property && !selectedProperty && (
                <p className="error-text mt-2">Please select a property</p>
              )}
            </div>
          ) : (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-medium text-blue-800">Property:</div>
              <div className="text-sm text-blue-700">{preSelectedProperty.title}</div>
              <div className="text-sm text-blue-600">
                {formatLocation(preSelectedProperty.location)}
              </div>
            </div>
          )}

          {/* Unit Selection - Show if property has units */}
          {selectedProperty?.hasUnits && (
            <div className="mb-4">
              <label className="label-text">Select Unit *</label>
              {loadingUnits ? (
                <p className="text-sm text-gray-500">Loading units...</p>
              ) : units.length === 0 ? (
                <p className="text-sm text-red-500">No available units found for this property</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {units.map((unit) => (
                      <div
                        key={unit._id}
                        onClick={() => handleUnitSelect(unit)}
                        className={`p-3 cursor-pointer rounded-lg border-2 transition-colors ${
                          selectedUnit?._id === unit._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-gray-900">Unit {unit.unitNumber}</div>
                            <div className="text-sm text-gray-600">
                              Floor {unit.floor || 'Ground'} • {unit.bedrooms} bed • {unit.bathrooms} bath • {unit.area} sq ft
                            </div>
                            {unit.furnished && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded mt-1 inline-block">
                                Furnished
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              KES {(unit.rent || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">per month</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedUnit && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                      ✓ Selected: Unit {selectedUnit.unitNumber} - KES {selectedUnit.rent?.toLocaleString()}/month
                    </div>
                  )}

                  <input type="hidden" {...register('unit')} />
                </div>
              )}
            </div>
          )}

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