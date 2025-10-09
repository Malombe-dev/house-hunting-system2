// client/src/components/forms/CreateAgentForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { ButtonLoader } from '../common/LoadingSpinner';
import api from '../../services/api';

const CreateAgentForm = ({ onSuccess, onCancel }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('agent');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/users/create-agent', {
        ...data,
        role: selectedType,
        createdBy: 'admin'
      });

      if (response.data.success) {
        alert(`${selectedType === 'agent' ? 'Agent' : 'Landlord'} account created successfully!`);
        onSuccess && onSuccess(response.data.user);
      }
    } catch (error) {
      console.error('Create agent error:', error);
      alert(error.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Create Agent/Landlord Account
        </h2>
        <BuildingOfficeIcon className="h-8 w-8 text-primary-500" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Account Type Selection */}
        <div>
          <label className="label-text">Account Type</label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <label
              className={`relative cursor-pointer rounded-lg border p-4 ${
                selectedType === 'agent'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                value="agent"
                {...register('accountType', { required: true })}
                onChange={(e) => setSelectedType(e.target.value)}
                className="sr-only"
              />
              <div className="text-center">
                <UserGroupIcon className="h-8 w-8 mx-auto mb-2 text-primary-500" />
                <div className="font-medium text-gray-900">Property Agent</div>
                <div className="text-xs text-gray-500 mt-1">
                  Manages properties for others
                </div>
              </div>
            </label>

            <label
              className={`relative cursor-pointer rounded-lg border p-4 ${
                selectedType === 'landlord'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                value="landlord"
                {...register('accountType', { required: true })}
                onChange={(e) => setSelectedType(e.target.value)}
                className="sr-only"
              />
              <div className="text-center">
                <BuildingOfficeIcon className="h-8 w-8 mx-auto mb-2 text-primary-500" />
                <div className="font-medium text-gray-900">Property Owner</div>
                <div className="text-xs text-gray-500 mt-1">
                  Owns and manages properties
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Personal Information */}
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

        {/* Contact Information */}
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
            placeholder="john@example.com"
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

        {/* Business Information */}
        <div>
          <label className="label-text">Business/Company Name</label>
          <input
            type="text"
            {...register('businessName')}
            className="input-field"
            placeholder="ABC Properties Ltd"
          />
        </div>

        <div>
          <label className="label-text">Business License Number</label>
          <input
            type="text"
            {...register('businessLicense')}
            className="input-field"
            placeholder="BL-2024-12345"
          />
        </div>

        {/* ID Number */}
        <div>
          <label className="label-text">National ID / Passport Number</label>
          <input
            type="text"
            {...register('idNumber')}
            className="input-field"
            placeholder="12345678"
          />
        </div>

        {/* Address */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">City</label>
            <input
              type="text"
              {...register('address.city')}
              className="input-field"
              placeholder="Nairobi"
            />
          </div>

          <div>
            <label className="label-text">Area/Estate</label>
            <input
              type="text"
              {...register('address.area')}
              className="input-field"
              placeholder="Westlands"
            />
          </div>
        </div>

        {/* Password */}
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
            User will be required to change password on first login
          </p>
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
              <ButtonLoader text="Creating..." />
            ) : (
              `Create ${selectedType === 'agent' ? 'Agent' : 'Landlord'} Account`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAgentForm;