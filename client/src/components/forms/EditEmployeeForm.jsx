// client/src/components/forms/EditEmployeeForm.jsx
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const EditEmployeeForm = ({ employee, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Use the SAME job titles as CreateEmployeeForm
  const jobTitles = [
    'Property Manager',
    'Leasing Agent',
    'Maintenance Coordinator',
    'Customer Service',
    'Accountant',
    'Receptionist',
    'Other'
  ];
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    branch: '',
    salary: '',
    address: '',
    city: '',
    state: '',
    country: 'Kenya',
    permissions: {
      canCreateTenants: false,
      canViewReports: false,
      canManageProperties: false,
      canHandlePayments: false,
      canCreateProperties: false,
      canApproveProperties: false
    },
    isActive: true
  });

  // Update form when employee data changes
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        jobTitle: employee.jobTitle || '',
        branch: employee.branch || '',
        salary: employee.salary || '',
        address: employee.address || '',
        city: employee.city || '',
        state: employee.state || '',
        country: employee.country || 'Kenya',
        permissions: {
          canCreateTenants: employee.permissions?.canCreateTenants || false,
          canViewReports: employee.permissions?.canViewReports || false,
          canManageProperties: employee.permissions?.canManageProperties || false,
          canHandlePayments: employee.permissions?.canHandlePayments || false,
          canCreateProperties: employee.permissions?.canCreateProperties || false,
          canApproveProperties: employee.permissions?.canApproveProperties || false
        },
        isActive: employee.isActive !== undefined ? employee.isActive : true
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('permissions.')) {
      const permissionField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionField]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation - SAME as CreateEmployeeForm
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.jobTitle) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Email validation - SAME as CreateEmployeeForm
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await api.put(`/users/${employee._id}`, formData);
      onSuccess(response.data.user);
    } catch (error) {
      console.error('Error updating employee:', error);
      setError(error.response?.data?.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <XMarkIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Personal Information - SAME as CreateEmployeeForm */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254712345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Professional Information - SAME as CreateEmployeeForm */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
        
        {/* Job Title - SAME dropdown as CreateEmployeeForm */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title/Position <span className="text-red-500">*</span>
          </label>
          <select
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">Select position</option>
            {jobTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>

        {/* Branch - SAME text input as CreateEmployeeForm */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branch/Office Location
          </label>
          <input
            type="text"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., Westlands Branch, Nairobi HQ"
          />
        </div>

        {/* Salary - SAME as CreateEmployeeForm */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salary (Optional)
          </label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="50000"
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address (Optional)
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="2"
              placeholder="Street address, city, etc."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Nairobi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/County
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Nairobi County"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Section - Enhanced with more options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Permissions</h3>
        <p className="text-sm text-gray-600 mb-4">Select what this employee can do in the system:</p>
        
        <div className="space-y-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              name="permissions.canCreateTenants"
              checked={formData.permissions.canCreateTenants}
              onChange={handleChange}
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
              name="permissions.canViewReports"
              checked={formData.permissions.canViewReports}
              onChange={handleChange}
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
              name="permissions.canManageProperties"
              checked={formData.permissions.canManageProperties}
              onChange={handleChange}
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
              name="permissions.canHandlePayments"
              checked={formData.permissions.canHandlePayments}
              onChange={handleChange}
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

          <label className="flex items-start">
            <input
              type="checkbox"
              name="permissions.canCreateProperties"
              checked={formData.permissions.canCreateProperties}
              onChange={handleChange}
              className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="block text-sm font-medium text-gray-900">
                Can create properties
              </span>
              <span className="block text-xs text-gray-500">
                Add new property listings
              </span>
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              name="permissions.canApproveProperties"
              checked={formData.permissions.canApproveProperties}
              onChange={handleChange}
              className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="block text-sm font-medium text-gray-900">
                Can approve properties
              </span>
              <span className="block text-xs text-gray-500">
                Approve or reject property listings
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Status Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Active Employee Account
          </label>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          When inactive, the employee cannot log in to the system.
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              Updating Employee...
            </>
          ) : (
            'Update Employee'
          )}
        </button>
      </div>
    </form>
  );
};

export default EditEmployeeForm;