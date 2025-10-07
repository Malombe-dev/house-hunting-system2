// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  LANDLORD: 'landlord',
  TENANT: 'tenant',
  SEEKER: 'seeker'
};

// Property Types
export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  STUDIO: 'studio',
  COMMERCIAL: 'commercial',
  LAND: 'land'
};

// Property Status
export const PROPERTY_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  PENDING: 'pending'
};

// Payment Status
export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Maintenance Request Status
export const MAINTENANCE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  PAYMENT_DUE: 'payment_due',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_OVERDUE: 'payment_overdue',
  MAINTENANCE_REQUEST: 'maintenance_request',
  MAINTENANCE_UPDATE: 'maintenance_update',
  LEASE_EXPIRY: 'lease_expiry',
  APPLICATION_STATUS: 'application_status',
  PROPERTY_APPROVED: 'property_approved',
  PROPERTY_REJECTED: 'property_rejected',
  SYSTEM_UPDATE: 'system_update'
};

// File Upload Constraints
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES_PER_UPLOAD: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

// Search and Filter Options
export const FILTER_OPTIONS = {
  PRICE_RANGES: [
    { label: 'Under KES 20K', min: 0, max: 20000 },
    { label: 'KES 20K - 50K', min: 20000, max: 50000 },
    { label: 'KES 50K - 100K', min: 50000, max: 100000 },
    { label: 'KES 100K - 200K', min: 100000, max: 200000 },
    { label: 'Above KES 200K', min: 200000, max: null }
  ],
  BEDROOMS: [
    { label: 'Studio', value: 0 },
    { label: '1 Bedroom', value: 1 },
    { label: '2 Bedrooms', value: 2 },
    { label: '3 Bedrooms', value: 3 },
    { label: '4+ Bedrooms', value: 4 }
  ],
  PROPERTY_FEATURES: [
    'parking',
    'garden',
    'swimming_pool',
    'gym',
    'security',
    'elevator',
    'balcony',
    'furnished',
    'air_conditioning',
    'internet',
    'water_backup',
    'generator'
  ]
};

// Kenyan Locations
export const KENYA_LOCATIONS = {
  COUNTIES: [
    'Nairobi',
    'Mombasa',
    'Kisumu',
    'Nakuru',
    'Eldoret',
    'Thika',
    'Malindi',
    'Kitale',
    'Garissa',
    'Kakamega',
    'Machakos',
    'Meru',
    'Nyeri',
    'Kericho',
    'Embu'
  ],
  NAIROBI_AREAS: [
    'Westlands',
    'Karen',
    'Kilimani',
    'Lavington',
    'Runda',
    'Muthaiga',
    'Gigiri',
    'Spring Valley',
    'Riverside',
    'Hurlingham',
    'Kileleshwa',
    'Langata',
    'South C',
    'South B',
    'Donholm',
    'Umoja',
    'Embakasi',
    'Kasarani',
    'Roysambu',
    'Ruaka'
  ]
};

// Currency Settings
export const CURRENCY = {
  CODE: 'KES',
  SYMBOL: 'KSh',
  LOCALE: 'en-KE'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy hh:mm a',
  TIME: 'hh:mm a'
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    MESSAGE: 'Password must contain at least 8 characters with uppercase, lowercase, and number'
  },
  PHONE: {
    PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
    MESSAGE: 'Please enter a valid phone number'
  },
  EMAIL: {
    PATTERN: /^\S+@\S+$/i,
    MESSAGE: 'Please enter a valid email address'
  },
  RENT: {
    MIN: 1000,
    MAX: 1000000,
    MESSAGE: 'Rent must be between KES 1,000 and KES 1,000,000'
  }
};

// Application States
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

// Lease States
export const LEASE_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  TERMINATED: 'terminated',
  PENDING: 'pending'
};

// Dashboard Cards Configuration
export const DASHBOARD_CARDS = {
  ADMIN: [
    { id: 'total_users', title: 'Total Users', icon: 'UserGroupIcon' },
    { id: 'total_properties', title: 'Total Properties', icon: 'BuildingOfficeIcon' },
    { id: 'pending_approvals', title: 'Pending Approvals', icon: 'ClockIcon' },
    { id: 'monthly_revenue', title: 'Monthly Revenue', icon: 'CurrencyDollarIcon' }
  ],
  AGENT: [
    { id: 'total_properties', title: 'My Properties', icon: 'HomeIcon' },
    { id: 'total_tenants', title: 'Active Tenants', icon: 'UserGroupIcon' },
    { id: 'monthly_income', title: 'Monthly Income', icon: 'BanknotesIcon' },
    { id: 'maintenance_requests', title: 'Maintenance Requests', icon: 'WrenchScrewdriverIcon' }
  ],
  TENANT: [
    { id: 'rent_due', title: 'Rent Due', icon: 'CurrencyDollarIcon' },
    { id: 'lease_expiry', title: 'Lease Expires', icon: 'CalendarIcon' },
    { id: 'maintenance_requests', title: 'My Requests', icon: 'WrenchScrewdriverIcon' },
    { id: 'payment_history', title: 'Payments Made', icon: 'ReceiptPercentIcon' }
  ]
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#22c55e',
  ACCENT: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SEARCH_HISTORY: 'search_history',
  SAVED_PROPERTIES: 'saved_properties'
};

// Feature Flags
export const FEATURES = {
  DARK_MODE: process.env.REACT_APP_ENABLE_DARK_MODE === 'true',
  ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  CHAT_SUPPORT: process.env.REACT_APP_ENABLE_CHAT === 'true',
  MULTI_LANGUAGE: process.env.REACT_APP_ENABLE_I18N === 'true',
  PUSH_NOTIFICATIONS: process.env.REACT_APP_ENABLE_PUSH === 'true'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Please contact support.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
  TIMEOUT: 'Request timeout. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back! You have been successfully logged in.',
  REGISTER: 'Account created successfully! Welcome to PropertyHub.',
  LOGOUT: 'You have been logged out successfully.',
  PROFILE_UPDATE: 'Your profile has been updated successfully.',
  PASSWORD_CHANGE: 'Password changed successfully.',
  PROPERTY_SAVED: 'Property saved to your favorites.',
  PROPERTY_REMOVED: 'Property removed from favorites.',
  APPLICATION_SENT: 'Your application has been submitted successfully.',
  PAYMENT_SUCCESS: 'Payment processed successfully.',
  MAINTENANCE_REQUEST: 'Maintenance request submitted successfully.'
};

// Default Values
export const DEFAULTS = {
  PROPERTY: {
    TYPE: PROPERTY_TYPES.APARTMENT,
    BEDROOMS: 1,
    BATHROOMS: 1,
    AREA: 50,
    RENT: 25000
  },
  PAGINATION: {
    PAGE: 1,
    SIZE: PAGINATION.DEFAULT_PAGE_SIZE
  },
  SEARCH: {
    SORT: 'createdAt',
    ORDER: 'desc',
    LOCATION: '',
    TYPE: '',
    MIN_PRICE: 0,
    MAX_PRICE: null
  }
};

// Regular Expressions
export const REGEX = {
  PHONE_KE: /^(\+254|0)[17]\d{8}$/,
  ID_NUMBER_KE: /^\d{7,8}$/,
  PASSPORT: /^[A-Z]{1,2}\d{6,9}$/,
  POSTAL_CODE_KE: /^\d{5}$/
};

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/propertyhub',
  TWITTER: 'https://twitter.com/propertyhub',
  INSTAGRAM: 'https://instagram.com/propertyhub',
  LINKEDIN: 'https://linkedin.com/company/propertyhub'
};

// Contact Information
export const CONTACT_INFO = {
  EMAIL: 'info@propertyhub.com',
  PHONE: '+254 712 345 678',
  ADDRESS: '123 Business Avenue, Nairobi, Kenya',
  SUPPORT_EMAIL: 'support@propertyhub.com',
  BUSINESS_HOURS: 'Monday - Friday: 8:00 AM - 6:00 PM'
};