// client/src/components/forms/CreateEmployeeForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, UserIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { ButtonLoader } from '../common/LoadingSpinner';
import api from '../../services/api';

const CreateEmployeeForm = ({ onSuccess, onCancel }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/users/create-employee', data);

      if (response.data.success) {
        alert('Employee account created successfully!');
        onSuccess && onSuccess(response.data.user);
      }
    } catch (error) {
      console.error('Create employee error:', error);
      alert(error.response?.data?.message || 'Failed to create employee account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Create Employee Account
        </h2>
        <UserIcon className="h-8 w-8 text-primary-500" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            placeholder="employee@example.com"
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

        {/* Job Information */}
        <div>
          <label className="label-text">Job Title/Position *</label>
          <select
            {...register('jobTitle', { required: 'Job title is required' })}
            className={`input-field ${errors.jobTitle ? 'input-error' : ''}`}
          >
            <option value="">Select position</option>
            <option value="property_manager">Property Manager</option>
            <option value="leasing_agent">Leasing Agent</option>
            <option value="maintenance_coordinator">Maintenance Coordinator</option>
            <option value="customer_service">Customer Service</option>
            <option value="accountant">Accountant</option>
            <option value="receptionist">Receptionist</option>
            <option value="other">Other</option>
          </select>
          {errors.jobTitle && (
            <p className="error-text">{errors.jobTitle.message}</p>
          )}
        </div>

        <div>
          <label className="label-text">Branch/Office Location</label>
          <input
            type="text"
            {...register('branch')}
            className="input-field"
            placeholder="e.g., Westlands Branch, Nairobi HQ"
          />
        </div>

        <div>
          <label className="label-text">Employee ID (Optional)</label>
          <input
            type="text"
            {...register('employeeId')}
            className="input-field"
            placeholder="EMP-001"
          />
        </div>

        {/* Permissions */}
        <div>
          <label className="label-text">Permissions</label>
          <div className="space-y-2 mt-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('permissions.canCreateTenants')}
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Can create and manage tenants
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('permissions.canViewReports')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Can view financial reports
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('permissions.canManageProperties')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Can manage property listings
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('permissions.canHandlePayments')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Can record and manage payments
              </span>
            </label>
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
            Employee will be required to change password on first login
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
              'Create Employee Account'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEmployeeForm;