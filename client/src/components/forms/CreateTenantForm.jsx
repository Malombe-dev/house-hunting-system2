// client/src/components/forms/CreateTenantForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { ButtonLoader } from '../common/LoadingSpinner';
import api from '../../services/api';

const CreateTenantForm = ({ onSuccess, onCancel }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const watchProperty = watch('property');

  // Fetch available properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await api.get('/properties?status=available');
        setProperties(response.data.properties || []);
      } catch (error) {
        console.error('Fetch properties error:', error);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/tenants/create', data);

      if (response.data.success) {
        alert('Tenant account created successfully!');
        onSuccess && onSuccess(response.data.tenant);
      }
    } catch (error) {
      console.error('Create tenant error:', error);
      alert(error.response?.data?.message || 'Failed to create tenant account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Create Tenant Account
        </h2>
        <UserPlusIcon className="h-8 w-8 text-primary-500" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">First Name *</label>
              <input
                type="text"
                {...register('firstName', {
                  required: 'First name is required',
                  minLength: { value: 2, message: 'Min 2 characters' }
                })}
                className={`input-field ${errors.firstName ? 'input-error' : ''}`}
                placeholder="John"
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
                  required: 'Last name is required',
                  minLength: { value: 2, message: 'Min 2 characters' }
                })}
                className={`input-field ${errors.lastName ? 'input-error' : ''}`}
                placeholder="Doe"
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
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Invalid email'
                  }
                })}
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="tenant@example.com"
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
                  required: 'Phone is required',
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Invalid phone'
                  }
                })}
                className={`input-field ${errors.phone ? 'input-error' : ''}`}
                placeholder="+254712345678"
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
              {...register('idNumber', { required: 'ID number is required' })}
              className={`input-field ${errors.idNumber ? 'input-error' : ''}`}
              placeholder="12345678"
            />
            {errors.idNumber && (
              <p className="error-text">{errors.idNumber.message}</p>
            )}
          </div>
        </div>

        {/* Property Selection */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Details</h3>
          
          <div>
            <label className="label-text">Select Property *</label>
            {loadingProperties ? (
              <p className="text-sm text-gray-500">Loading properties...</p>
            ) : (
              <select
                {...register('property', { required: 'Property is required' })}
                className={`input-field ${errors.property ? 'input-error' : ''}`}
              >
                <option value="">Choose a property</option>
                {properties.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.name} - {property.address} (KES {property.rent}/month)
                  </option>
                ))}
              </select>
            )}
            {errors.property && (
              <p className="error-text">{errors.property.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
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
                {...register('leaseDuration', { required: 'Lease duration is required' })}
                className={`input-field ${errors.leaseDuration ? 'input-error' : ''}`}
              >
                <option value="">Select duration</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months (1 Year)</option>
                <option value="24">24 Months (2 Years)</option>
                <option value="36">36 Months (3 Years)</option>
              </select>
              {errors.leaseDuration && (
                <p className="error-text">{errors.leaseDuration.message}</p>
              )}
            </div>
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
                {...register('employer.name')}
                className="input-field"
                placeholder="Company name"
              />
            </div>

            <div>
              <label className="label-text">Employer Phone</label>
              <input
                type="tel"
                {...register('employer.phone')}
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
                {...register('emergencyContact.name', { required: 'Emergency contact name is required' })}
                className={`input-field ${errors.emergencyContact?.name ? 'input-error' : ''}`}
                placeholder="Jane Doe"
              />
              {errors.emergencyContact?.name && (
                <p className="error-text">{errors.emergencyContact.name.message}</p>
              )}
            </div>

            <div>
              <label className="label-text">Contact Phone *</label>
              <input
                type="tel"
                {...register('emergencyContact.phone', { required: 'Emergency contact phone is required' })}
                className={`input-field ${errors.emergencyContact?.phone ? 'input-error' : ''}`}
                placeholder="+254700000000"
              />
              {errors.emergencyContact?.phone && (
                <p className="error-text">{errors.emergencyContact.phone.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="label-text">Relationship *</label>
            <input
              type="text"
              {...register('emergencyContact.relationship', { required: 'Relationship is required' })}
              className={`input-field ${errors.emergencyContact?.relationship ? 'input-error' : ''}`}
              placeholder="e.g., Spouse, Parent, Sibling"
            />
            {errors.emergencyContact?.relationship && (
              <p className="error-text">{errors.emergencyContact.relationship.message}</p>
            )}
          </div>
        </div>

        {/* Account Credentials */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Credentials</h3>
          
          <div>
            <label className="label-text">Initial Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Min 8 characters' }
                })}
                className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                placeholder="Create password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Tenant will be able to change password after first login
            </p>
          </div>
        </div>

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
              <ButtonLoader text="Creating Tenant..." />
            ) : (
              'Create Tenant Account'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTenantForm;