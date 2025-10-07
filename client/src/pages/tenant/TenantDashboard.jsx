import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  CurrencyDollarIcon,
  CalendarIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const TenantDashboard = () => {
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTenantData({
          currentProperty: {
            id: 'prop_001',
            title: 'Modern 2BR Apartment in Westlands',
            address: 'Westlands Road, Nairobi',
            rent: 65000,
            image: '/api/placeholder/400/300'
          },
          lease: {
            startDate: '2023-06-01',
            endDate: '2024-06-01',
            status: 'active',
            daysRemaining: 125,
            renewalNoticeRequired: 60
          },
          rentStatus: {
            currentMonth: {
              amount: 65000,
              dueDate: '2024-02-01',
              status: 'paid',
              paidDate: '2024-01-28'
            },
            nextPayment: {
              amount: 65000,
              dueDate: '2024-03-01',
              daysUntilDue: 8
            },
            totalPaid: 585000,
            overdueAmount: 0
          },
          maintenanceRequests: [
            {
              id: 'maint_001',
              title: 'Kitchen Faucet Leak',
              description: 'The kitchen faucet has been leaking for 2 days',
              status: 'in_progress',
              priority: 'medium',
              submittedDate: '2024-01-20',
              category: 'plumbing'
            },
            {
              id: 'maint_002',
              title: 'Air Conditioning Not Working',
              description: 'AC unit in living room stopped working',
              status: 'completed',
              priority: 'high',
              submittedDate: '2024-01-15',
              completedDate: '2024-01-18',
              category: 'hvac'
            }
          ],
          agent: {
            name: 'Jane Doe',
            phone: '+254712345678',
            email: 'jane.doe@example.com',
            responseTime: '2 hours average'
          }
        });
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading your dashboard..." />
      </div>
    );
  }

  if (!tenantData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Property Found</h2>
        <p className="text-gray-600">You are not currently renting any property.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your rental information and account status.
        </p>
      </div>

      {/* Current Property Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img
              src={tenantData.currentProperty.image}
              alt={tenantData.currentProperty.title}
              className="h-48 w-full object-cover md:h-full"
            />
          </div>
          <div className="p-6 md:w-2/3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your Current Home</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                tenantData.lease.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                Lease {tenantData.lease.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {tenantData.currentProperty.title}
            </h3>
            <p className="text-gray-600 mb-4">{tenantData.currentProperty.address}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Monthly Rent</p>
                  <p className="font-semibold">{formatPrice(tenantData.currentProperty.rent)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Lease Expires</p>
                  <p className="font-semibold">{new Date(tenantData.lease.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <HomeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Property ID</p>
                  <p className="font-semibold">#{tenantData.currentProperty.id.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          to="/tenant/payments"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BanknotesIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Pay Rent</h3>
          <p className="text-sm text-gray-600">Make payment online</p>
        </Link>

        <Link
          to="/tenant/maintenance"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Maintenance</h3>
          <p className="text-sm text-gray-600">Report issues</p>
        </Link>

        <Link
          to="/tenant/lease"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <DocumentTextIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Lease</h3>
          <p className="text-sm text-gray-600">View agreement</p>
        </Link>

        <Link
          to="/tenant/payment-history"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ClockIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">History</h3>
          <p className="text-sm text-gray-600">Payment records</p>
        </Link>
      </div>

      {/* Rent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Rent Status</h3>
          
          {/* Current Month */}
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Current Month</span>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {formatPrice(tenantData.rentStatus.currentMonth.amount)}
                </p>
                <p className="text-sm text-green-700">
                  Paid on {new Date(tenantData.rentStatus.currentMonth.paidDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Next Payment */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Next Payment</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                tenantData.rentStatus.nextPayment.daysUntilDue <= 7
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {tenantData.rentStatus.nextPayment.daysUntilDue} days to go
              </span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {formatPrice(tenantData.rentStatus.nextPayment.amount)}
                </p>
                <p className="text-sm text-blue-700">
                  Due: {new Date(tenantData.rentStatus.nextPayment.dueDate).toLocaleDateString()}
                </p>
              </div>
              <Link
                to="/tenant/payments"
                className="btn-primary btn-sm"
              >
                Pay Now
              </Link>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(tenantData.rentStatus.totalPaid)}
                </p>
                <p className="text-sm text-gray-600">Total Paid</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {tenantData.lease.daysRemaining}
                </p>
                <p className="text-sm text-gray-600">Days Left on Lease</p>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Maintenance Requests</h3>
            <Link
              to="/tenant/maintenance"
              className="text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {tenantData.maintenanceRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{request.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    request.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Submitted: {new Date(request.submittedDate).toLocaleDateString()}</span>
                  <span className="capitalize">{request.priority} priority</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Link
              to="/tenant/maintenance/new"
              className="w-full btn-secondary text-center"
            >
              <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
              Report New Issue
            </Link>
          </div>
        </div>
      </div>

      {/* Lease Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Lease Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{tenantData.lease.daysRemaining}</div>
            <div className="text-sm text-gray-600">Days Remaining</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{tenantData.lease.renewalNoticeRequired}</div>
            <div className="text-sm text-gray-600">Notice Required (days)</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900 capitalize">{tenantData.lease.status}</div>
            <div className="text-sm text-gray-600">Lease Status</div>
          </div>
        </div>

        {tenantData.lease.daysRemaining <= tenantData.lease.renewalNoticeRequired && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Lease Renewal Notice Required
                </p>
                <p className="text-sm text-yellow-700">
                  Your lease expires in {tenantData.lease.daysRemaining} days. Please contact your agent to discuss renewal options.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Property Agent</h3>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-primary-600">
              {tenantData.agent.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{tenantData.agent.name}</h4>
            <p className="text-sm text-gray-600">Response time: {tenantData.agent.responseTime}</p>
          </div>
          <div className="flex space-x-2">
            <a
              href={`tel:${tenantData.agent.phone}`}
              className="btn-primary btn-sm"
            >
              Call
            </a>
            <a
              href={`mailto:${tenantData.agent.email}`}
              className="btn-secondary btn-sm"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;