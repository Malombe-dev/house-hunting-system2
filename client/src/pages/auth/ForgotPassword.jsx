import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { BuildingOfficeIcon, EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ButtonLoader } from '../../components/common/LoadingSpinner';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  const { forgotPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await forgotPassword(data.email);
      
      if (result.success) {
        setIsEmailSent(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
              <BuildingOfficeIcon className="h-10 w-10 text-primary-500" />
              <span className="text-2xl font-bold gradient-text">PropertyHub</span>
            </Link>
            
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-100 mb-6">
              <EnvelopeIcon className="h-8 w-8 text-success-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Check your email
            </h2>
            <p className="text-gray-600 mb-8">
              We've sent a password reset link to{' '}
              <span className="font-medium text-gray-900">{getValues('email')}</span>
            </p>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => {
                    setIsEmailSent(false);
                    setIsLoading(false);
                  }}
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  try again
                </button>
              </p>
              
              <Link
                to="/auth/login"
                className="flex items-center justify-center space-x-2 text-primary-600 hover:text-primary-500 font-medium"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="flex min-h-screen">
        {/* Left Section - Info */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-primary-600 lg:to-primary-700">
          <div className="max-w-md text-center text-white px-8">
            <h3 className="text-3xl font-bold mb-4">
              Forgot Your Password?
            </h3>
            <p className="text-lg text-primary-100 mb-8">
              No worries! We'll help you reset your password and get back to managing your properties.
            </p>
            
            <div className="space-y-4 text-left">
              {[
                'Enter your email address',
                'Check your inbox for reset link',
                'Create a new secure password',
                'Sign in with your new password'
              ].map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-700">{index + 1}</span>
                  </div>
                  <span className="text-primary-100">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
              <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
                <BuildingOfficeIcon className="h-10 w-10 text-primary-500" />
                <span className="text-2xl font-bold gradient-text">PropertyHub</span>
              </Link>
              
              <h2 className="text-3xl font-bold text-gray-900">
                Reset your password
              </h2>
              <p className="mt-2 text-gray-600">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              {/* Email */}
              <div>
                <label className="label-text">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className={`input-field ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="error-text">{errors.email.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? <ButtonLoader text="Sending reset link..." /> : 'Send Reset Link'}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/auth/login"
                  className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back to sign in</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;