

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, EyeSlashIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { ButtonLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import Footer from '../../components/common/Footer';
import Header from '../../components/common/Header';
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      console.log('📤 Sending login data:', data);
      const result = await login(data);
      console.log('🔑 Login result:', result);
  
      if (result.success) {
        // Check if password change is required
        if (result.requiresPasswordChange) {
          console.log('🔄 Password change required');
          console.log('Temp token:', result.tempToken);
          console.log('User:', result.user);
          
          navigate('/auth/first-login-change-password', { 
            state: { 
              user: result.user,
              tempToken: result.tempToken,
              from: from 
            },
            replace: true
          });
          return;
        }
        
        // ✅ FIX: Wait a bit for AuthContext to update and ensure user data is available
        if (!result.user) {
          console.error('❌ No user data in login result');
          toast.error('Login successful but user data is missing. Please refresh.');
          return;
        }
  
        console.log('✅ Login successful - User:', result.user);
        console.log('🔐 Permissions:', result.user?.permissions);
        
        toast.success(`Welcome back, ${result.user.firstName}!`);
        
        // ✅ FIX: Add small delay to ensure AuthContext state is updated
        setTimeout(() => {
          const redirectPath = getRoleBasedRedirect(result.user.role);
          console.log('🎯 Redirecting to:', redirectPath);
          navigate(redirectPath, { replace: true });
        }, 200); // Increased delay to ensure state propagation
        
      } else {
        // Handle case where result.success is false
        console.error('❌ Login failed in result:', result);
        toast.error(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
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
    case 'employee':
      return '/employee/dashboard'; 
    case 'tenant':
      return '/tenant/dashboard';
    case 'seeker':
      return from === '/auth/login' ? '/' : from;
    default:
      return '/';
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />
      <div className="flex min-h-screen">
        {/* Left Section - Form */}
      

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
              <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
                <BuildingOfficeIcon className="h-10 w-10 text-primary-500" />
                <span className="text-2xl font-bold gradient-text">PropertyHub</span>
              </Link>
              
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back
              </h2>
              <p className="mt-2 text-gray-600">
                Sign in to your account to continue
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
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="error-text">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="label-text">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    {...register('rememberMe')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? <ButtonLoader text="Signing in..." /> : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Don't have an account?
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <Link
                  to="/auth/register"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Create your account
                </Link>
              </div>
            </form>

            {/* Demo Credentials Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-900 mb-2">Test Credentials:</p>
              <div className="text-xs text-blue-800 space-y-1">
                <p><strong>Email:</strong> test@gmail.com</p>
                <p><strong>Password:</strong> Use the temporary password provided</p>
                <p className="text-blue-600 mt-2">
                  💡 First-time login will prompt password change
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Image/Info */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-primary-600 lg:to-primary-700">
          <div className="max-w-md text-center text-white px-8">
            <h3 className="text-3xl font-bold mb-4">
              Manage Properties with Ease
            </h3>
            <p className="text-lg text-primary-100 mb-8">
              Streamline your property management, track payments, and keep tenants happy with our comprehensive platform.
            </p>
            
            {/* Features */}
            <div className="space-y-4 text-left">
              {[
                'Complete property management suite',
                'Automated rent tracking and reminders',
                'Maintenance request management',
                'Detailed analytics and reporting'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary-200 rounded-full"></div>
                  <span className="text-primary-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
