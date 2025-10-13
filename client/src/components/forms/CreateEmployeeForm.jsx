// client/src/components/forms/CreateEmployeeForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, UserIcon } from '@heroicons/react/24/outline';
import { ButtonLoader } from '../common/LoadingSpinner';
import { apiMethods } from '../../services/api';
import toast from 'react-hot-toast';

const CreateEmployeeForm = ({ onSuccess, onCancel }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      permissions: {
        canCreateTenants: true,
        canViewReports: false,
        canManageProperties: false,
        canHandlePayments: false
      }
    }
  });


const onSubmit = async (data) => {
  setIsLoading(true);
  try {
    console.log('Creating employee with data:', data);
    
    const response = await apiMethods.post('/users/create-employee', data);
    console.log('Create employee response:', response);

    if (response.success) {
      const employee = response.employee;
      toast.success('Employee account created successfully!');
      
      // Show temporary password in a more prominent way
      alert(
        `Employee Account Created!\n\n` +
        `Name: ${employee.firstName} ${employee.lastName}\n` +
        `Email: ${employee.email}\n` +
        `Role: Employee\n` +
        `Permissions: ${Object.keys(employee.permissions || {}).filter(key => employee.permissions[key]).join(', ') || 'None'}\n` +
        `Temporary Password: ${employee.tempPassword}\n\n` +
        `⚠️ IMPORTANT: Save this password securely!\n` +
        `The employee will be required to change it on first login.\n` +
        `They will be redirected to the employee dashboard.`
      );
      
      onSuccess && onSuccess(employee);
    }
  } catch (error) {
    console.error('Create employee error:', error);
    const errorMessage = error.message || error.error || 'Failed to create employee account';
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-h-[90vh] overflow-y-auto">
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
                value: /^[\+]?[0-9]{10,15}$/,
                message: 'Invalid phone number'
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
            <option value="Property Manager">Property Manager</option>
            <option value="Leasing Agent">Leasing Agent</option>
            <option value="Maintenance Coordinator">Maintenance Coordinator</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Accountant">Accountant</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Other">Other</option>
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
          <label className="label-text">Salary (Optional)</label>
          <input
            type="number"
            {...register('salary', { min: 0 })}
            className="input-field"
            placeholder="50000"
          />
        </div>

        <div>
          <label className="label-text">Address (Optional)</label>
          <textarea
            {...register('address')}
            className="input-field"
            rows="2"
            placeholder="Street address, city, etc."
          />
        </div>

        {/* Permissions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Employee Permissions
          </label>
          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="checkbox"
                {...register('permissions.canCreateTenants')}
                className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-3">
                <span className="block text-sm font-medium text-gray-900">
                  Can create and manage tenants
                </span>
                <span className="block text-xs text-gray-500">
                  Add new tenants, update tenant information
                </span>
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                {...register('permissions.canViewReports')}
                className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-3">
                <span className="block text-sm font-medium text-gray-900">
                  Can view financial reports
                </span>
                <span className="block text-xs text-gray-500">
                  Access to analytics and financial data
                </span>
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                {...register('permissions.canManageProperties')}
                className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-3">
                <span className="block text-sm font-medium text-gray-900">
                  Can manage property listings
                </span>
                <span className="block text-xs text-gray-500">
                  Create, edit, and manage properties
                </span>
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                {...register('permissions.canHandlePayments')}
                className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-3">
                <span className="block text-sm font-medium text-gray-900">
                  Can record and manage payments
                </span>
                <span className="block text-xs text-gray-500">
                  Record rent payments and generate receipts
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> A temporary password will be automatically generated. 
            The employee will be required to change it on first login.
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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