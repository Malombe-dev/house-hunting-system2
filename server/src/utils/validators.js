// server/src/utils/validators.js

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate phone number (Kenyan format)
  const isValidPhone = (phone) => {
    // Accepts formats: +254700000000, 254700000000, 0700000000
    const phoneRegex = /^(\+254|254|0)[17]\d{8}$/;
    return phoneRegex.test(phone);
  };
  
  // Format phone number to international format
  const formatPhoneNumber = (phone) => {
    // Remove spaces and dashes
    phone = phone.replace(/[\s-]/g, '');
    
    // Convert to international format
    if (phone.startsWith('0')) {
      return '+254' + phone.slice(1);
    } else if (phone.startsWith('254')) {
      return '+' + phone;
    } else if (phone.startsWith('+254')) {
      return phone;
    }
    
    return phone;
  };
  
  // Validate password strength
  const isValidPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };
  
  // Validate MongoDB ObjectId
  const isValidObjectId = (id) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  };
  
  // Validate URL
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Validate date
  const isValidDate = (date) => {
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate);
  };
  
  // Validate future date
  const isFutureDate = (date) => {
    const parsedDate = new Date(date);
    return parsedDate > new Date();
  };
  
  // Validate past date
  const isPastDate = (date) => {
    const parsedDate = new Date(date);
    return parsedDate < new Date();
  };
  
  // Validate number range
  const isInRange = (value, min, max) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  };
  
  // Validate array
  const isValidArray = (arr, minLength = 0, maxLength = Infinity) => {
    return Array.isArray(arr) && arr.length >= minLength && arr.length <= maxLength;
  };
  
  // Sanitize string (remove HTML tags)
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '');
  };
  
  // Validate image file type
  const isValidImageType = (mimetype) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(mimetype);
  };
  
  // Validate file size (in bytes)
  const isValidFileSize = (size, maxSize = 5 * 1024 * 1024) => {
    return size <= maxSize;
  };
  
  // Validate coordinates (latitude, longitude)
  const isValidCoordinates = (lat, lng) => {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };
  
  // Validate rent amount (must be positive)
  const isValidRentAmount = (amount) => {
    const num = Number(amount);
    return !isNaN(num) && num > 0 && num <= 1000000; // Max 1M
  };
  
  // Validate property type
  const isValidPropertyType = (type) => {
    const validTypes = ['apartment', 'house', 'studio', 'penthouse', 'bedsitter', 'commercial'];
    return validTypes.includes(type.toLowerCase());
  };
  
  // Validate user role
  const isValidUserRole = (role) => {
    const validRoles = ['admin', 'agent', 'tenant', 'seeker'];
    return validRoles.includes(role.toLowerCase());
  };
  
  // Validate payment method
  const isValidPaymentMethod = (method) => {
    const validMethods = ['mpesa', 'bank_transfer', 'cash', 'cheque'];
    return validMethods.includes(method.toLowerCase());
  };
  
  // Validate status
  const isValidStatus = (status, validStatuses) => {
    return validStatuses.includes(status.toLowerCase());
  };
  
  // Trim and validate required fields
  const validateRequiredFields = (data, requiredFields) => {
    const errors = [];
    
    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        errors.push(`${field} is required`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // Clean object (remove null, undefined, empty strings)
  const cleanObject = (obj) => {
    const cleaned = {};
    
    Object.keys(obj).forEach(key => {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
        cleaned[key] = obj[key];
      }
    });
    
    return cleaned;
  };
  
  module.exports = {
    isValidEmail,
    isValidPhone,
    formatPhoneNumber,
    isValidPassword,
    isValidObjectId,
    isValidUrl,
    isValidDate,
    isFutureDate,
    isPastDate,
    isInRange,
    isValidArray,
    sanitizeString,
    isValidImageType,
    isValidFileSize,
    isValidCoordinates,
    isValidRentAmount,
    isValidPropertyType,
    isValidUserRole,
    isValidPaymentMethod,
    isValidStatus,
    validateRequiredFields,
    cleanObject
  };