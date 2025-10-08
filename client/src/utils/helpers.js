// server/src/utils/helpers.js

// Pagination helper
const paginate = (page = 1, limit = 10) => {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    return {
      skip: (pageNum - 1) * limitNum,
      limit: limitNum,
      page: pageNum
    };
  };
  
  // Calculate pagination metadata
  const getPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    
    return {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  };
  
  // Generate random string
  const generateRandomString = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  };
  
  // Generate unique code
  const generateUniqueCode = (prefix = '', length = 8) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 2 + length);
    return `${prefix}${timestamp}${random}`.toUpperCase();
  };
  
  // Format currency
  const formatCurrency = (amount, currency = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date, format = 'long') => {
    const options = {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    };
    
    return new Date(date).toLocaleDateString('en-GB', options[format] || options.long);
  };
  
  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format datetime
  const formatDateTime = (date) => {
    return `${formatDate(date, 'short')} ${formatTime(date)}`;
  };
  
  // Calculate days between dates
  const daysBetween = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((new Date(date1) - new Date(date2)) / oneDay));
  };
  
  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    const compareDate = new Date(date);
    
    return (
      compareDate.getDate() === today.getDate() &&
      compareDate.getMonth() === today.getMonth() &&
      compareDate.getFullYear() === today.getFullYear()
    );
  };
  
  // Get month name
  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };
  
  // Get current month-year string
  const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  
  // Slugify string
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };
  
  // Capitalize first letter
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  
  // Truncate text
  const truncate = (text, length = 100, suffix = '...') => {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
  };
  
  // Deep clone object
  const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
  
  // Remove duplicates from array
  const removeDuplicates = (arr) => {
    return [...new Set(arr)];
  };
  
  //