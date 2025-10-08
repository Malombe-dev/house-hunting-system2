// server/src/middleware/logger.js
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const accessLogPath = path.join(logsDir, 'access.log');
const errorLogPath = path.join(logsDir, 'error.log');

// Color codes for console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Format timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Get method color
const getMethodColor = (method) => {
  const methodColors = {
    GET: colors.green,
    POST: colors.blue,
    PUT: colors.yellow,
    DELETE: colors.red,
    PATCH: colors.magenta
  };
  return methodColors[method] || colors.reset;
};

// Get status color
const getStatusColor = (status) => {
  if (status >= 500) return colors.red;
  if (status >= 400) return colors.yellow;
  if (status >= 300) return colors.cyan;
  if (status >= 200) return colors.green;
  return colors.reset;
};

// Write to log file
const writeToFile = (filePath, message) => {
  try {
    fs.appendFileSync(filePath, message + '\n');
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
};

// Log to console
const logToConsole = (req, res, duration) => {
  const method = req.method;
  const url = req.originalUrl || req.url;
  const status = res.statusCode;
  const ip = req.ip || req.connection.remoteAddress;
  
  const methodColor = getMethodColor(method);
  const statusColor = getStatusColor(status);
  
  console.log(
    `${colors.cyan}[${getTimestamp()}]${colors.reset} ` +
    `${methodColor}${method}${colors.reset} ` +
    `${url} ` +
    `${statusColor}${status}${colors.reset} ` +
    `${duration}ms ` +
    `${colors.reset}${ip}`
  );
};

// Log to file
const logToFile = (req, res, duration) => {
  const logEntry = {
    timestamp: getTimestamp(),
    method: req.method,
    url: req.originalUrl || req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent') || 'unknown',
    user: req.user ? req.user.id : 'anonymous'
  };
  
  writeToFile(accessLogPath, JSON.stringify(logEntry));
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log to console (development)
    if (process.env.NODE_ENV === 'development') {
      logToConsole(req, res, duration);
    }
    
    // Log to file (production)
    if (process.env.NODE_ENV === 'production') {
      logToFile(req, res, duration);
    }
  });
  
  next();
};

// Error logger
const errorLogger = (error, req, res, next) => {
  const errorLog = {
    timestamp: getTimestamp(),
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code || 'UNKNOWN'
    },
    request: {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'unknown',
      user: req.user ? req.user.id : 'anonymous'
    }
  };
  
  // Log to console
  console.error(
    `${colors.red}[ERROR]${colors.reset} ` +
    `${errorLog.timestamp} - ${error.message}`
  );
  
  // Log to file
  writeToFile(errorLogPath, JSON.stringify(errorLog));
  
  next(error);
};

// API statistics tracker
const apiStats = {
  totalRequests: 0,
  totalErrors: 0,
  endpointStats: new Map()
};

const statsTracker = (req, res, next) => {
  apiStats.totalRequests++;
  
  const endpoint = `${req.method} ${req.route ? req.route.path : req.path}`;
  
  if (!apiStats.endpointStats.has(endpoint)) {
    apiStats.endpointStats.set(endpoint, { count: 0, errors: 0 });
  }
  
  const stats = apiStats.endpointStats.get(endpoint);
  stats.count++;
  
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      apiStats.totalErrors++;
      stats.errors++;
    }
  });
  
  next();
};

// Get API statistics
const getStats = () => {
  return {
    totalRequests: apiStats.totalRequests,
    totalErrors: apiStats.totalErrors,
    errorRate: ((apiStats.totalErrors / apiStats.totalRequests) * 100).toFixed(2) + '%',
    endpoints: Array.from(apiStats.endpointStats.entries()).map(([endpoint, stats]) => ({
      endpoint,
      ...stats,
      errorRate: ((stats.errors / stats.count) * 100).toFixed(2) + '%'
    }))
  };
};

module.exports = {
  requestLogger,
  errorLogger,
  statsTracker,
  getStats
};