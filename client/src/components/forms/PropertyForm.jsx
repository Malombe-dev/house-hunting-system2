import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  PhotoIcon, 
  XMarkIcon, 
  PlusIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { PROPERTY_TYPES, KENYA_LOCATIONS, FILTER_OPTIONS } from '../../utils/constants';
import LoadingSpinner, { ButtonLoader } from '../common/LoadingSpinner';

const PropertyForm = ({ 
  property = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [uploadedImages, setUploadedImages] = useState(property?.images || []);
  const [imageFiles, setImageFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: property || {
      title: '',
      description: '',
      propertyType: PROPERTY_TYPES.APARTMENT,
      rent: '',
      deposit: '',
      bedrooms: 1,
      bathrooms: 1,
      area: '',
      location: {
        address: '',
        city: 'nairobi',
        area: ''
      },
      features: [],
      furnished: false,
      petsAllowed: false,
      smokingAllowed: false
    }
  });

  const watchedFeatures = watch('features') || [];
  const watchedRent = watch('rent');

  // Handle image upload
  const handleImageUpload = useCallback((files) => {
    const newFiles = Array.from(files).slice(0, 10 - uploadedImages.length);
    const newImageUrls = newFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    
    setImageFiles(prev => [...prev, ...newFiles]);
    setUploadedImages(prev => [...prev, ...newImageUrls]);
  }, [uploadedImages.length]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeImage = (index) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      // Revoke URL if it's a local file
      if (newImages[index].url && newImages[index].file) {
        URL.revokeObjectURL(newImages[index].url);
      }
      newImages.splice(index, 1);
      return newImages;
    });
    setImageFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleFeatureToggle = (feature) => {
    const currentFeatures = watchedFeatures;
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    setValue('features', newFeatures);
  };

  const formatFeatureName = (feature) => {
    return feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const onFormSubmit = (data) => {
    const formData = {
      ...data,
      images: imageFiles,
      existingImages: uploadedImages.filter(img => !img.file).map(img => img.url)
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <HomeIcon className="h-5 w-5 mr-2 text-primary-500" />
          Basic Information
        </h3>

        <div className="space-y-6">
          {/* Property Title */}
          <div>
            <label className="label-text">Property Title *</label>
            <input
              type="text"
              {...register('title', { 
                required: 'Property title is required',
                minLength: { value: 10, message: 'Title must be at least 10 characters' }
              })}
              className={`input-field ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g., Modern 2BR Apartment in Westlands"
            />
            {errors.title && <p className="error-text">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label-text">Description *</label>
            <textarea
              rows={4}
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 50, message: 'Description must be at least 50 characters' }
              })}
              className={`input-field ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe the property, its features, and what makes it special..."
            />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>

          {/* Property Type */}
          <div>
            <label className="label-text">Property Type *</label>
            <select
              {...register('propertyType', { required: 'Property type is required' })}
              className={`input-field ${errors.propertyType ? 'input-error' : ''}`}
            >
              <option value={PROPERTY_TYPES.APARTMENT}>Apartment</option>
              <option value={PROPERTY_TYPES.HOUSE}>House</option>
              <option value={PROPERTY_TYPES.STUDIO}>Studio</option>
              <option value={PROPERTY_TYPES.COMMERCIAL}>Commercial</option>
            </select>
            {errors.propertyType && <p className="error-text">{errors.propertyType.message}</p>}
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Property Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Bedrooms */}
          <div>
            <label className="label-text">Bedrooms *</label>
            <select
              {...register('bedrooms', { required: 'Number of bedrooms is required' })}
              className={`input-field ${errors.bedrooms ? 'input-error' : ''}`}
            >
              <option value={0}>Studio</option>
              {[1,2,3,4,5,6].map(num => (
                <option key={num} value={num}>{num} Bedroom{num > 1 ? 's' : ''}</option>
              ))}
            </select>
            {errors.bedrooms && <p className="error-text">{errors.bedrooms.message}</p>}
          </div>

          {/* Bathrooms */}
          <div>
            <label className="label-text">Bathrooms *</label>
            <select
              {...register('bathrooms', { required: 'Number of bathrooms is required' })}
              className={`input-field ${errors.bathrooms ? 'input-error' : ''}`}
            >
              {[1,2,3,4,5,6].map(num => (
                <option key={num} value={num}>{num} Bathroom{num > 1 ? 's' : ''}</option>
              ))}
            </select>
            {errors.bathrooms && <p className="error-text">{errors.bathrooms.message}</p>}
          </div>

          {/* Area */}
          <div>
            <label className="label-text">Area (m²) *</label>
            <input
              type="number"
              {...register('area', { 
                required: 'Area is required',
                min: { value: 10, message: 'Area must be at least 10 m²' }
              })}
              className={`input-field ${errors.area ? 'input-error' : ''}`}
              placeholder="85"
            />
            {errors.area && <p className="error-text">{errors.area.message}</p>}
          </div>

          {/* Floor (for apartments) */}
          <div>
            <label className="label-text">Floor (optional)</label>
            <input
              type="number"
              {...register('floor')}
              className="input-field"
              placeholder="e.g., 3"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <CurrencyDollarIcon className="h-5 w-5 mr-2 text-primary-500" />
          Pricing
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Rent */}
          <div>
            <label className="label-text">Monthly Rent (KES) *</label>
            <input
              type="number"
              {...register('rent', { 
                required: 'Monthly rent is required',
                min: { value: 1000, message: 'Rent must be at least KES 1,000' }
              })}
              className={`input-field ${errors.rent ? 'input-error' : ''}`}
              placeholder="65000"
            />
            {errors.rent && <p className="error-text">{errors.rent.message}</p>}
          </div>

          {/* Security Deposit */}
          <div>
            <label className="label-text">Security Deposit (KES)</label>
            <input
              type="number"
              {...register('deposit')}
              className="input-field"
              placeholder={watchedRent ? (watchedRent * 2).toString() : '130000'}
            />
            <p className="text-sm text-gray-500 mt-1">
              Typically 1-2 months rent (suggested: {watchedRent ? `KES ${(watchedRent * 2).toLocaleString()}` : 'KES 130,000'})
            </p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2 text-primary-500" />
          Location
        </h3>

        <div className="space-y-6">
          {/* Address */}
          <div>
            <label className="label-text">Street Address *</label>
            <input
              type="text"
              {...register('location.address', { required: 'Address is required' })}
              className={`input-field ${errors.location?.address ? 'input-error' : ''}`}
              placeholder="e.g., Westlands Road, Building Name"
            />
            {errors.location?.address && <p className="error-text">{errors.location.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* City */}
            <div>
              <label className="label-text">City *</label>
              <select
                {...register('location.city', { required: 'City is required' })}
                className={`input-field ${errors.location?.city ? 'input-error' : ''}`}
              >
                {KENYA_LOCATIONS.COUNTIES.map(county => (
                  <option key={county.toLowerCase()} value={county.toLowerCase()}>
                    {county}
                  </option>
                ))}
              </select>
              {errors.location?.city && <p className="error-text">{errors.location.city.message}</p>}
            </div>

            {/* Area/Neighborhood */}
            <div>
              <label className="label-text">Area/Neighborhood *</label>
              <input
                type="text"
                {...register('location.area', { required: 'Area is required' })}
                className={`input-field ${errors.location?.area ? 'input-error' : ''}`}
                placeholder="e.g., Westlands, Kilimani"
              />
              {errors.location?.area && <p className="error-text">{errors.location.area.message}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Features & Amenities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Features & Amenities</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {FILTER_OPTIONS.PROPERTY_FEATURES.map((feature) => (
            <label
              key={feature}
              className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={watchedFeatures.includes(feature)}
                onChange={() => handleFeatureToggle(feature)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{formatFeatureName(feature)}</span>
            </label>
          ))}
        </div>

        {/* Additional Options */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('furnished')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Furnished</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('petsAllowed')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Pets Allowed</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('smokingAllowed')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Smoking Allowed</span>
            </label>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Property Images</h3>

        {/* Image Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 mb-4">
            <p className="text-lg font-medium">Drop images here or click to upload</p>
            <p className="text-sm">Maximum 10 images, up to 5MB each</p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files)}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="btn-primary cursor-pointer"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Select Images
          </label>
        </div>

        {/* Image Preview */}
        {uploadedImages.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Uploaded Images ({uploadedImages.length}/10)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={image.id || index} className="relative group">
                  <img
                    src={image.url || image}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                      Main
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              The first image will be used as the main photo. Drag to reorder.
            </p>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary min-w-[120px]"
        >
          {loading ? <ButtonLoader text="Saving..." /> : (property ? 'Update Property' : 'Create Property')}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;