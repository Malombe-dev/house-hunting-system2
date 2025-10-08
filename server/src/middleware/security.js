// server/src/middleware/security.js

// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // HTTP Strict Transport Security
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self';"
    );
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    );
    
    next();
  };
  
  // Sanitize input to prevent XSS
  const sanitizeInput = (input) => {
    if (typeof input === 'string') {
      return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    return input;
  };
  
  // Request sanitization middleware
  const sanitizeRequest = (req, res, next) => {
    // Sanitize body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeInput(req.body[key]);
        }
      });
    }
    
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeInput(req.query[key]);
        }
      });
    }
    
    // Sanitize URL parameters
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeInput(req.params[key]);
        }
      });
    }
    
    next();
  };
  
  // Prevent parameter pollution
  const preventParameterPollution = (req, res, next) => {
    // Convert array parameters to single values (take first value)
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (Array.isArray(req.query[key])) {
          req.query[key] = req.query[key][0];
        }
      });
    }
    
    next();
  };
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /\.\.\//,
    /\/etc\/passwd/,
    /\bselect\b.*\bfrom\b/i,
    /\bunion\b.*\bselect\b/i,
    /\bdrop\b.*\btable\b/i
  ];
  
  // Detect malicious requests
  const detectMaliciousRequest = (req, res, next) => {
    const checkString = (str) => {
      if (typeof str !== 'string') return false;
      return suspiciousPatterns.some(pattern => pattern.test(str));
    };
    
    // Check URL
    if (checkString(req.url)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Suspicious request detected'
      });
    }
    
    // Check body
    if (req.body) {
      const bodyString = JSON.stringify(req.body);
      if (checkString(bodyString)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Suspicious request detected'
        });
      }
    }
    
    next();
  };
  
  // IP whitelist (for admin routes)
  const ipWhitelist = (allowedIPs = []) => {
    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      
      // In development, allow all IPs
      if (process.env.NODE_ENV === 'development') {
        return next();
      }
      
      if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
        return next();
      }
      
      res.status(403).json({
        success: false,
        message: 'Access denied: IP not whitelisted'
      });
    };
  };
  
  // Request size limiter
  const requestSizeLimiter = (maxSize = '10mb') => {
    return (req, res, next) => {
      const contentLength = req.headers['content-length'];
      
      if (contentLength) {
        const size = parseInt(contentLength);
        const maxBytes = parseSize(maxSize);
        
        if (size > maxBytes) {
          return res.status(413).json({
            success: false,
            message: 'Request entity too large'
          });
        }
      }
      
      next();
    };
  };
  
  // Parse size string to bytes
  const parseSize = (size) => {
    if (typeof size === 'number') return size;
    
    const units = {
      b: 1,
      kb: 1024,
      mb: 1024 * 1024,
      gb: 1024 * 1024 * 1024
    };
    
    const match = size.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    return value * (units[unit] || 1);
  };
  
  // Honeypot trap (for bot detection)
  const honeypot = (req, res, next) => {
    // Check for honeypot field
    if (req.body && req.body.website) {
      // If honeypot field is filled, it's likely a bot
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      });
    }
    
    next();
  };
  
  module.exports = {
    securityHeaders,
    sanitizeRequest,
    sanitizeInput,
    preventParameterPollution,
    detectMaliciousRequest,
    ipWhitelist,
    requestSizeLimiter,
    honeypot
  };