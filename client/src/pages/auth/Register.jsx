import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, EyeSlashIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';
import { ButtonLoader } from '../../components/common/LoadingSpinner';
import '../../App.css';
const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('seeker');
  
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      role: 'seeker'
    }
  });

  const watchPassword = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await registerUser(data);
      
      if (result.success) {
        // Navigate based on user role
        const redirectPath = getRoleBasedRedirect(result.user.role);
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBasedRedirect = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'agent':
      case 'landlord':
        return '/agent/dashboard';
      case 'tenant':
        return '/tenant/dashboard';
      case 'seeker':
        return '/';
      default:
        return '/';
    }
  };

  const roleOptions = [
    {
      value: 'seeker',
      label: 'House Seeker',
      description: 'Looking for a property to rent',
      icon: '🏠'
    },
    {
      value: 'agent',
      label: 'Property Agent',
      description: 'Manage and list properties',
      icon: '🏢'
    },
    {
      value: 'landlord',
      label: 'Property Owner',
      description: 'Own and rent out properties',
      icon: '🏘️'
    },
    {
      value: 'tenant',
      label: 'Current Tenant',
      description: 'Already renting a property',
      icon: '🔑'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <div className="flex min-h-screen">
        {/* Left Section - Image/Info */}
        {/* Left Section - Image/Info - WITH ANIMATED VIDEO BACKGROUND */}
<div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center relative overflow-hidden">
  {/* Video Background */}
  <div className="absolute inset-0">
    <video
      autoPlay
      muted
      loop
      playsInline
      className="w-full h-full object-cover"
      poster="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1973&q=80"
    >
      {/* You can use these free stock video URLs or replace with your own */}
      <source src="https://www.pinterest.com/i/1AR6MgznK/" type="video/mp4" />
     
    </video>
    
    {/* Dark Overlay for better text readability */}
    <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/40 to-blue-900/50"></div>
    
    {/* Subtle animated gradient overlay */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-500/20 to-transparent animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-500/20 to-transparent animate-pulse" style={{animationDelay: '1.5s'}}></div>
    </div>
  </div>
  
  {/* Floating particles animation */}
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${15 + Math.random() * 10}s`
        }}
      />
    ))}
  </div>
  
  {/* Content */}
  <div className="max-w-md text-center text-white px-8 relative z-10">
    {/* Animated Icon/Logo */}
    <div className="flex justify-center mb-6">
      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg animate-bounce-slow">
        <BuildingOfficeIcon className="h-8 w-8 text-white" />
      </div>
    </div>
    
    {/* Header with fade-in animation */}
    <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent animate-fade-in-up">
      Your Journey Begins Here
    </h3>
    
    {/* Description */}
    <p className="text-lg text-blue-100 mb-10 leading-relaxed font-light animate-fade-in-up" style={{animationDelay: '0.2s'}}>
      Experience the future of real estate with immersive virtual tours 
      and smart property matching tailored just for you.
    </p>
    
    {/* Benefits with staggered animations */}
    <div className="space-y-5 text-left">
      {[
        {
          text: 'Virtual Property Tours',
          icon: '🏠',
          delay: '0.4s'
        },
        {
          text: 'AI-Powered Matching', 
          icon: '🤖',
          delay: '0.6s'
        },
        {
          text: 'Instant Notifications',
          icon: '⚡',
          delay: '0.8s'
        },
        {
          text: '24/7 Expert Support',
          icon: '🎯',
          delay: '1.0s'
        }
      ].map((benefit, index) => (
        <div 
          key={index} 
          className="flex items-center space-x-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 group hover:shadow-lg transform hover:-translate-y-1 animate-fade-in-up"
          style={{animationDelay: benefit.delay}}
        >
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:rotate-12">
            <span className="text-xl">{benefit.icon}</span>
          </div>
          <span className="text-white font-medium group-hover:text-blue-50 transition-colors duration-300">
            {benefit.text}
          </span>
        </div>
      ))}
    </div>

    {/* Animated Stats */}
    <div className="mt-12 pt-8 border-t border-white/30 animate-fade-in-up" style={{animationDelay: '1.2s'}}>
      <div className="flex justify-around text-center">
        <div className="transform hover:scale-110 transition-transform duration-300">
          <div className="text-2xl font-bold text-white animate-count-up" data-target="10000">10K+</div>
          <div className="text-blue-200 text-sm">Properties</div>
        </div>
        <div className="transform hover:scale-110 transition-transform duration-300">
          <div className="text-2xl font-bold text-white animate-count-up" data-target="5000">5K+</div>
          <div className="text-blue-200 text-sm">Happy Users</div>
        </div>
        <div className="transform hover:scale-110 transition-transform duration-300">
          <div className="text-2xl font-bold text-white">99%</div>
          <div className="text-blue-200 text-sm">Satisfaction</div>
        </div>
      </div>
    </div>
  </div>

  {/* Bottom gradient fade */}
  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent"></div>
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
                Create your account
              </h2>
              <p className="mt-2 text-gray-600">
                Join thousands of users managing properties efficiently
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              {/* Role Selection */}
              <div>
                <label className="label-text">I am a</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {roleOptions.map((role) => (
                    <label
                      key={role.value}
                      className={`relative cursor-pointer rounded-lg border p-4 focus:outline-none ${
                        selectedRole === role.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        value={role.value}
                        {...register('role', { required: 'Please select your role' })}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="text-xl mr-2">{role.icon}</div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{role.label}</div>
                            <div className="text-gray-500 text-xs">{role.description}</div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.role && (
                  <p className="error-text">{errors.role.message}</p>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">First Name</label>
                  <input
                    type="text"
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters'
                      }
                    })}
                    className={`input-field ${errors.firstName ? 'input-error' : ''}`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="error-text">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="label-text">Last Name</label>
                  <input
                    type="text"
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters'
                      }
                    })}
                    className={`input-field ${errors.lastName ? 'input-error' : ''}`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="error-text">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label-text">Email Address</label>
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
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="error-text">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="label-text">Phone Number</label>
                <input
                  type="tel"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[\+]?[1-9][\d]{0,15}$/,
                      message: 'Invalid phone number'
                    }
                  })}
                  className={`input-field ${errors.phone ? 'input-error' : ''}`}
                  placeholder="+254712345678"
                />
                {errors.phone && (
                  <p className="error-text">{errors.phone.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="label-text">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain uppercase, lowercase, and number'
                      }
                    })}
                    className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="error-text">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="label-text">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => 
                        value === watchPassword || 'Passwords do not match'
                    })}
                    className={`input-field pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="error-text">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  {...register('acceptTerms', {
                    required: 'You must accept the terms and conditions'
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="error-text">{errors.acceptTerms.message}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? <ButtonLoader text="Creating account..." /> : 'Create Account'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <Link
                  to="/auth/login"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Sign in to your account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;