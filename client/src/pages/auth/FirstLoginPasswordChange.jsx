// client/src/pages/auth/FirstLoginChangePassword.jsx
// In FirstLoginChangePassword.jsx - FIX THE IMPORT
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast'; // Make sure you have this import



const FirstLoginChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [tempToken, setTempToken] = useState(null);
  const { completePasswordChange } = useAuth();

  useEffect(() => {
    // Get user and temp token from navigation state
    const state = location.state;
    if (!state || !state.tempToken || !state.user) {
      navigate('/login', { replace: true });
      return;
    }
    
    setUser(state.user);
    setTempToken(state.tempToken);
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const validatePassword = () => {
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Call the API to change password
      const response = await authService.firstLoginChangePassword({
        tempToken,
        newPassword: formData.newPassword
      });
      
      console.log('Password change response:', response);
      
      if (response.data?.success || response.success) {
        const responseData = response.data || response;
        const token = responseData.data?.token || responseData.token;
        const userData = responseData.data?.user || responseData.user;
        
        if (!token || !userData) {
          throw new Error('Invalid response from server');
        }
        
        // Use the new method to update auth state
        completePasswordChange(userData, token);
        
        // Navigate based on role
        const redirectPath = getRoleBasedRedirect(userData.role);
        console.log('🔄 Redirecting to:', redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        throw new Error(response.data?.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      const errorMessage = err.response?.data?.message || err.message || err.error || 'Failed to change password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBasedRedirect = (role) => {
    const routes = {
      admin: '/admin/dashboard',
      agent: '/agent/dashboard',
      landlord: '/agent/dashboard',
      employee: '/employee/dashboard', 
      tenant: '/tenant/dashboard',
      seeker: '/seeker/properties'
    };
    return routes[role] || '/';
  };

  const getPasswordStrength = () => {
    const password = formData.newPassword;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;
    
    let label = '';
    let color = '';
    
    if (strength < 30) {
      label = 'Weak';
      color = 'bg-red-500';
    } else if (strength < 60) {
      label = 'Fair';
      color = 'bg-yellow-500';
    } else if (strength < 80) {
      label = 'Good';
      color = 'bg-blue-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }
    
    return { strength, label, color };
  };

  const passwordStrength = getPasswordStrength();

  if (!user || !tempToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-100 rounded-full">
              <LockClosedIcon className="h-12 w-12 text-primary-600" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Change Your Password
            </h2>
            <p className="text-gray-600">
              Welcome, <span className="font-semibold">{user.firstName}</span>! 
              Please create a new password for your account.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.label === 'Strong' ? 'text-green-600' :
                      passwordStrength.label === 'Good' ? 'text-blue-600' :
                      passwordStrength.label === 'Fair' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center text-xs">
                  {formData.newPassword === formData.confirmPassword ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <span className="text-red-600">Passwords do not match</span>
                  )}
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>At least 6 characters long</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Use a mix of uppercase and lowercase letters (recommended)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Include numbers and special characters (recommended)</span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Changing Password...
                </>
              ) : (
                'Change Password & Continue'
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Your password will be securely encrypted and stored.
        </p>
      </div>
    </div>
  );
};

export default FirstLoginChangePassword;