import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = '', 
  fullScreen = false 
}) => {
  // Size configurations
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  // Color configurations
  const colorClasses = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-500',
    success: 'border-success-500',
    danger: 'border-danger-500'
  };

  const spinnerClasses = `
    ${sizeClasses[size]} 
    border-4 border-gray-200 border-t-4 
    ${colorClasses[color]} 
    rounded-full animate-spin
  `;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={spinnerClasses}></div>
      {text && (
        <p className="text-sm text-gray-600 font-medium">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Specialized loading components
export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="large" text={text} />
  </div>
);

export const ButtonLoader = ({ text = 'Loading...' }) => (
  <div className="flex items-center space-x-2">
    <LoadingSpinner size="small" color="white" />
    <span>{text}</span>
  </div>
);

export const CardLoader = () => (
  <div className="card-base animate-pulse">
    <div className="space-y-4 p-6">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

export const TableLoader = ({ rows = 5, columns = 4 }) => (
  <div className="animate-pulse">
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default LoadingSpinner;