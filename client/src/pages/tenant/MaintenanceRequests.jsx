import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  WrenchScrewdriverIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  CalendarIcon,
  XMarkIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { useForm } from 'react-hook-form';

const MaintenanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Mock maintenance requests data
  const mockRequests = [
    {
      id: 'maint_001',
      title: 'Kitchen Faucet Leak',
      description: 'The kitchen faucet has been leaking for 2 days. Water drips constantly even when turned off completely.',
      category: 'plumbing',
      priority: 'medium',
      status: 'in_progress',
      submittedDate: '2024-01-20T10:30:00Z',
      assignedTo: 'John the Plumber',
      estimatedCompletion: '2024-01-25T17:00:00Z',
      updates: [
        {
          date: '2024-01-22T14:20:00Z',
          message: 'Plumber has been assigned and will visit tomorrow',
          author: 'Property Agent'
        },
        {
          date: '2024-01-23T09:15:00Z',
          message: 'Visited the property. Need to order replacement parts.',
          author: 'John the Plumber'
        }
      ],
      images: ['/api/placeholder/300/200']
    },
    {
      id: 'maint_002',
      title: 'Air Conditioning Not Working',
      description: 'AC unit in living room stopped working yesterday. Room is getting very hot.',
      category: 'hvac',
      priority: 'high',
      status: 'completed',
      submittedDate: '2024-01-15T16:45:00Z',
      completedDate: '2024-01-18T11:30:00Z',
      assignedTo: 'HVAC Solutions Ltd',
      updates: [
        {
          date: '2024-01-16T10:00:00Z',
          message: 'HVAC technician scheduled for tomorrow',
          author: 'Property Agent'
        },
        {
          date: '2024-01-17T14:30:00Z',
          message: 'Replaced faulty compressor. AC is now working properly.',
          author: 'HVAC Technician'
        }
      ],
      rating: 5,
      feedback: 'Very professional service. Fixed quickly.'
    },
    {
      id: 'maint_003',
      title: 'Bathroom Door Lock Broken',
      description: 'The lock on the main bathroom door is broken and won\'t lock properly.',
      category: 'general',
      priority: 'low',
      status: 'pending',
      submittedDate: '2024-01-22T08:20:00Z',
      updates: []
    }
  ];

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRequests(mockRequests);
      } catch (error) {
        console.error('Error fetching maintenance requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleNewRequest = async (data) => {
    setSubmittingRequest(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newRequest = {
        id: `maint_${Date.now()}`,
        ...data,
        status: 'pending',
        priority: data.priority || 'medium',
        submittedDate: new Date().toISOString(),
        updates: [],
        images: selectedImages
      };
      
      setRequests(prev => [newRequest, ...prev]);
      setShowNewRequestModal(false);
      reset();
      setSelectedImages([]);
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    // In a real app, you would upload to a server
    // For now, we'll create object URLs for preview
    const newImages = files.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-red-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600 bg-green-100 border-green-200',
      medium: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      high: 'text-red-600 bg-red-100 border-red-200'
    };
    return colors[priority] || colors.medium;
  };

  const formatCategory = (category) => {
    const categories = {
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      hvac: 'HVAC',
      appliances: 'Appliances',
      general: 'General Maintenance',
      cleaning: 'Cleaning',
      security: 'Security'
    };
    return categories[category] || category;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-600 mt-1">
            Report issues and track maintenance progress
          </p>
        </div>
        <button
          onClick={() => setShowNewRequestModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Requests</h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size="large" text="Loading requests..." />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No maintenance requests</h3>
              <p className="text-gray-600 mb-6">
                You haven't submitted any maintenance requests yet.
              </p>
              <button
                onClick={() => setShowNewRequestModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Submit First Request
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewRequest(request)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(request.status)}
                        <h4 className="text-lg font-semibold text-gray-900">{request.title}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(request.priority)}`}>
                          {request.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(request.submittedDate).toLocaleDateString()}
                        </span>
                        <span className="capitalize">{formatCategory(request.category)}</span>
                        {request.updates.length > 0 && (
                          <span className="flex items-center">
                            <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                            {request.updates.length} update{request.updates.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {request.images && request.images.length > 0 && (
                      <div className="ml-4">
                        <img
                          src={request.images[0]}
                          alt="Request"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  
                  {request.assignedTo && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Assigned to:</span> {request.assignedTo}
                      </p>
                      {request.estimatedCompletion && request.status === 'in_progress' && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Estimated completion:</span> {new Date(request.estimatedCompletion).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      <Modal
        isOpen={showNewRequestModal}
        onClose={() => {
          setShowNewRequestModal(false);
          reset();
          setSelectedImages([]);
        }}
        title="Submit Maintenance Request"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleNewRequest)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="label-text">Request Title *</label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className={`input-field ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g., Kitchen Faucet Leak"
            />
            {errors.title && <p className="error-text">{errors.title.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="label-text">Category *</label>
            <select
              {...register('category', { required: 'Category is required' })}
              className={`input-field ${errors.category ? 'input-error' : ''}`}
            >
              <option value="">Select Category</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC/Air Conditioning</option>
              <option value="appliances">Appliances</option>
              <option value="general">General Maintenance</option>
              <option value="cleaning">Cleaning</option>
              <option value="security">Security</option>
            </select>
            {errors.category && <p className="error-text">{errors.category.message}</p>}
          </div>

          {/* Priority */}
          <div>
            <label className="label-text">Priority *</label>
            <select
              {...register('priority', { required: 'Priority is required' })}
              className={`input-field ${errors.priority ? 'input-error' : ''}`}
            >
              <option value="low">Low - Can wait a few days</option>
              <option value="medium">Medium - Should be fixed soon</option>
              <option value="high">High - Urgent, needs immediate attention</option>
            </select>
            {errors.priority && <p className="error-text">{errors.priority.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label-text">Description *</label>
            <textarea
              rows={4}
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 20, message: 'Please provide more details (at least 20 characters)' }
              })}
              className={`input-field ${errors.description ? 'input-error' : ''}`}
              placeholder="Please describe the issue in detail, including when it started, what you've tried, and any other relevant information..."
            />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>

          {/* Preferred Contact Method */}
          <div>
            <label className="label-text">Preferred Contact Method</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="phone"
                  {...register('contactMethod')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Phone call</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="email"
                  {...register('contactMethod')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="text"
                  {...register('contactMethod')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Text message</span>
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="label-text">Attach Photos (Optional)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>Upload photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
              </div>
            </div>

            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="mt-4">
                <label className="label-text">Selected Images</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowNewRequestModal(false);
                reset();
                setSelectedImages([]);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingRequest}
              className="btn-primary"
            >
              {submittingRequest ? (
                <div className="flex items-center">
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Submitting...</span>
                </div>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Request Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Maintenance Request Details"
        size="xl"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedRequest.title}</h3>
                <p className="text-gray-600 mt-1">{selectedRequest.description}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{formatCategory(selectedRequest.category)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-medium">{formatDate(selectedRequest.submittedDate)}</span>
                </div>
              </div>
            </div>

            {/* Assigned Info */}
            {selectedRequest.assignedTo && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Assigned Professional</h4>
                <p className="text-blue-800">{selectedRequest.assignedTo}</p>
                {selectedRequest.estimatedCompletion && (
                  <p className="text-blue-700 text-sm mt-1">
                    Estimated completion: {formatDate(selectedRequest.estimatedCompletion)}
                  </p>
                )}
              </div>
            )}

            {/* Images */}
            {selectedRequest.images && selectedRequest.images.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Attached Photos</h4>
                <div className="flex gap-4 overflow-x-auto">
                  {selectedRequest.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Maintenance issue ${index + 1}`}
                      className="w-48 h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Updates */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Updates & Progress</h4>
              {selectedRequest.updates.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No updates yet</p>
              ) : (
                <div className="space-y-4">
                  {selectedRequest.updates.map((update, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-900">{update.message}</p>
                        <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                          {formatDate(update.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">— {update.author}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completion Info */}
            {selectedRequest.status === 'completed' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-green-900">Request Completed</h4>
                </div>
                <p className="text-green-800 text-sm mt-1">
                  Completed on: {formatDate(selectedRequest.completedDate)}
                </p>
                {selectedRequest.feedback && (
                  <div className="mt-2">
                    <p className="text-green-900 font-medium">Your Feedback:</p>
                    <p className="text-green-800">{selectedRequest.feedback}</p>
                    {selectedRequest.rating && (
                      <div className="flex items-center mt-1">
                        <span className="text-green-900 font-medium mr-2">Rating:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < selectedRequest.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// Add missing StarIcon component
const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default MaintenanceRequests;