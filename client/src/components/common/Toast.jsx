import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Toast = ({ 
  type = 'info', // 'success', 'error', 'warning', 'info'
  title,
  message,
  duration = 5000,
  onClose,
  position = 'top-right' // 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const getIcon = () => {
    const iconClasses = "h-5 w-5 flex-shrink-0";
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClasses} text-green-500`} />;
      case 'error':
        return <XCircleIcon className={`${iconClasses} text-red-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClasses} text-yellow-500`} />;
      case 'info':
      default:
        return <InformationCircleIcon className={`${iconClasses} text-blue-500`} />;
    }
  };

  const getStyles = () => {
    const baseStyles = "max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden";
    
    const positionStyles = {
      'top-right': 'fixed top-4 right-4 z-50',
      'top-left': 'fixed top-4 left-4 z-50',
      'bottom-right': 'fixed bottom-4 right-4 z-50',
      'bottom-left': 'fixed bottom-4 left-4 z-50',
      'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
      'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50'
    };

    const animationStyles = isExiting
      ? 'transition-all duration-300 ease-in-out opacity-0 transform scale-95'
      : 'transition-all duration-300 ease-in-out opacity-100 transform scale-100';

    return `${baseStyles} ${positionStyles[position]} ${animationStyles}`;
  };

  if (!isVisible) return null;

  return (
    <div className={getStyles()}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className="text-sm font-medium text-gray-900 mb-1">
                {title}
              </p>
            )}
            {message && (
              <p className="text-sm text-gray-600">
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Manager Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = ({ type = 'info', title, message, duration = 5000, position = 'top-right' }) => {
    const id = Date.now();
    const toast = { id, type, title, message, duration, position };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, title = 'Success', options = {}) => {
    return showToast({ type: 'success', title, message, ...options });
  };

  const error = (message, title = 'Error', options = {}) => {
    return showToast({ type: 'error', title, message, ...options });
  };

  const warning = (message, title = 'Warning', options = {}) => {
    return showToast({ type: 'warning', title, message, ...options });
  };

  const info = (message, title = 'Info', options = {}) => {
    return showToast({ type: 'info', title, message, ...options });
  };

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};

// Toast Container Component
export const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={0} // Managed by useToast hook
          position={toast.position}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </>
  );
};

export default Toast;