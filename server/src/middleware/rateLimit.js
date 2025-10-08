// server/src/middleware/rateLimit.js

// Simple in-memory rate limiter
const rateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.resetTime > 0) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Rate limit middleware
const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Limit each IP to 100 requests per windowMs
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    keyGenerator = (req) => req.ip || req.connection.remoteAddress
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    let record = rateLimitStore.get(key);
    
    if (!record) {
      // First request from this key
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, record);
      return next();
    }
    
    // Check if window has expired
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      rateLimitStore.set(key, record);
      return next();
    }
    
    // Increment counter
    record.count++;
    
    // Check if limit exceeded
    if (record.count > max) {
      return res.status(statusCode).json({
        success: false,
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
    
    next();
  };
};

// Specific rate limiters for different routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again after 15 minutes.'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.'
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Rate limit exceeded, please try again later.'
});

module.exports = {
  rateLimit,
  authLimiter,
  apiLimiter,
  strictLimiter
};