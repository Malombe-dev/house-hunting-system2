// server/src/utils/formatters.js

// Format currency (Kenyan Shillings)
const formatCurrency = (amount, includeSymbol = true) => {
    const formatted = new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
    
    return includeSymbol ? `KES ${formatted}` : formatted;
  };
  
  // Format phone number
  const formatPhoneNumber = (phone) => {
    // Convert to +254 format
    if (phone.startsWith('0')) {
      return '+254' + phone.slice(1);
    } else if (phone.startsWith('254')) {
      return '+' + phone;
    }
    return phone;
  };
  
  // Mask phone number (show last 4 digits)
  const maskPhoneNumber = (phone) => {
    if (phone.length < 4) return phone;
    return '****' + phone.slice(-4);
  };
  
  // Mask email
  const maskEmail = (email) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + '***' + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };
  
  // Format date to readable string
  const formatDate = (date, format = 'full') => {
    const d = new Date(date);
    
    const formats = {
      short: { day: 'numeric', month: 'short', year: 'numeric' },
      medium: { day: 'numeric', month: 'long', year: 'numeric' },
      full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      }
    };
    
    return d.toLocaleDateString('en-GB', formats[format] || formats.full);
  };
  
  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    
    return 'just now';
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };
  
  // Format percentage
  const formatPercentage = (value, decimals = 2) => {
    return `${Number(value).toFixed(decimals)}%`;
  };
  
  // Format duration (milliseconds to readable format)
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };
  
  // Format address
  const formatAddress = (address) => {
    const { street, city, state, country, postalCode } = address;
    const parts = [street, city, state, postalCode, country].filter(Boolean);
    return parts.join(', ');
  };
  
  // Format full name
  const formatFullName = (firstName, lastName, middleName = null) => {
    if (middleName) {
      return `${firstName} ${middleName} ${lastName}`;
    }
    return `${firstName} ${lastName}`;
  };
  
  // Format initials
  const formatInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  // Format property name
  const formatPropertyName = (name, maxLength = 50) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };
  
  // Format coordinates
  const formatCoordinates = (lat, lng) => {
    return `${Number(lat).toFixed(6)}°, ${Number(lng).toFixed(6)}°`;
  };
  
  // Format month/year
  const formatMonthYear = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Format lease period
  const formatLeasePeriod = (startDate, endDate) => {
    const start = formatDate(startDate, 'short');
    const end = formatDate(endDate, 'short');
    return `${start} - ${end}`;
  };
  
  // Format rating
  const formatRating = (rating, maxRating = 5) => {
    return `${Number(rating).toFixed(1)}/${maxRating}`;
  };
  
  // Format status badge text
  const formatStatusBadge = (status) => {
    const statusMap = {
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      cancelled: 'Cancelled',
      available: 'Available',
      occupied: 'Occupied',
      maintenance: 'Under Maintenance'
    };
    
    return statusMap[status.toLowerCase()] || status;
  };
  
  // Format payment status
  const formatPaymentStatus = (status) => {
    const statusMap = {
      pending: 'Pending Payment',
      completed: 'Paid',
      failed: 'Payment Failed',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    };
    
    return statusMap[status.toLowerCase()] || status;
  };
  
  // Format array to comma-separated string
  const formatArrayToString = (arr, separator = ', ') => {
    if (!Array.isArray(arr)) return '';
    return arr.join(separator);
  };
  
  // Format boolean to Yes/No
  const formatBoolean = (value) => {
    return value ? 'Yes' : 'No';
  };
  
  // Strip HTML tags
  const stripHtml = (html) => {
    return html.replace(/<[^>]*>/g, '');
  };
  
  // Truncate text with ellipsis
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };
  
  module.exports = {
    formatCurrency,
    formatPhoneNumber,
    maskPhoneNumber,
    maskEmail,
    formatDate,
    formatTime,
    formatRelativeTime,
    formatFileSize,
    formatPercentage,
    formatDuration,
    formatAddress,
    formatFullName,
    formatInitials,
    formatPropertyName,
    formatCoordinates,
    formatMonthYear,
    formatLeasePeriod,
    formatRating,
    formatStatusBadge,
    formatPaymentStatus,
    formatArrayToString,
    formatBoolean,
    stripHtml,
    truncateText
  };