import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { 
  CurrencyDollarIcon,
  CalendarIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const RentPayments = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [processingPayment, setProcessingPayment] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setPaymentData({
          property: {
            title: 'Modern 2BR Apartment in Westlands',
            address: 'Westlands Road, Nairobi',
            id: 'PROP_001'
          },
          currentRent: {
            amount: 65000,
            dueDate: '2024-03-01',
            status: 'due', // 'paid', 'due', 'overdue'
            daysUntilDue: 8,
            lateFee: 0
          },
          nextPayment: {
            amount: 65000,
            dueDate: '2024-04-01'
          },
          paymentMethods: [
            {
              id: 'card',
              name: 'Credit/Debit Card',
              icon: CreditCardIcon,
              processingTime: 'Instant',
              fee: 0
            },
            {
              id: 'mpesa',
              name: 'M-Pesa',
              icon: PhoneIcon,
              processingTime: 'Instant',
              fee: 50
            },
            {
              id: 'bank',
              name: 'Bank Transfer',
              icon: BanknotesIcon,
              processingTime: '1-2 business days',
              fee: 0
            }
          ],
          agent: {
            name: 'Jane Doe',
            phone: '+254712345678',
            email: 'jane.doe@example.com'
          }
        });
      } catch (error) {
        console.error('Error fetching payment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  const handlePayment = async () => {
    setProcessingPayment(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update payment status
      setPaymentData(prev => ({
        ...prev,
        currentRent: {
          ...prev.currentRent,
          status: 'paid'
        }
      }));
      
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      due: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      overdue: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.due;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      default:
        return <ClockIcon className="h-6 w-6 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading payment information..." />
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Payment Information</h2>
        <p className="text-gray-600">Unable to load payment information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rent Payments</h1>
        <p className="text-gray-600 mt-1">
          Manage your rent payments and view payment history
        </p>
      </div>

      {/* Property Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Property</p>
            <p className="font-medium text-gray-900">{paymentData.property.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-medium text-gray-900">{paymentData.property.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Property ID</p>
            <p className="font-medium text-gray-900">{paymentData.property.id}</p>
          </div>
        </div>
      </div>

      {/* Current Payment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Payment</h2>
            {getStatusIcon(paymentData.currentRent.status)}
          </div>
          
          <div className={`p-6 rounded-xl border-2 ${getStatusColor(paymentData.currentRent.status)}`}>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(paymentData.currentRent.amount)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Due: {new Date(paymentData.currentRent.dueDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            {paymentData.currentRent.status === 'paid' ? (
              <div className="text-center">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Payment Complete</p>
                <button className="mt-4 btn-secondary btn-sm">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Download Receipt
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentData.currentRent.status === 'overdue' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Payment Overdue</p>
                        <p className="text-xs text-red-600">
                          Late fee: {formatPrice(paymentData.currentRent.lateFee)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {paymentData.currentRent.status === 'due' 
                      ? `Payment due in ${paymentData.currentRent.daysUntilDue} days`
                      : 'Payment is overdue'}
                  </p>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full btn-primary"
                  >
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    Pay Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Payment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Payment</h2>
          
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {formatPrice(paymentData.nextPayment.amount)}
              </div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Due: {new Date(paymentData.nextPayment.dueDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Auto-pay Setup */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCardIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">Set up Auto-pay</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Never miss a payment. Set up automatic rent payments for convenience.
                </p>
                <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Set up now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
            <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
              View all
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {/* Sample payment history items */}
            {[
              { date: '2024-02-01', amount: 65000, status: 'paid', method: 'M-Pesa' },
              { date: '2024-01-01', amount: 65000, status: 'paid', method: 'Bank Transfer' },
              { date: '2023-12-01', amount: 65000, status: 'paid', method: 'Credit Card' }
            ].map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatPrice(payment.amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(payment.date).toLocaleDateString()} • {payment.method}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Paid
                  </span>
                  <button className="text-primary-600 hover:text-primary-800">
                    <DocumentArrowDownIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Agent */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Contact your agent</p>
            <p className="text-sm text-gray-600">{paymentData.agent.name}</p>
          </div>
          <div className="flex space-x-2">
            <a
              href={`tel:${paymentData.agent.phone}`}
              className="btn-secondary btn-sm"
            >
              <PhoneIcon className="h-4 w-4 mr-1" />
              Call
            </a>
            <a
              href={`mailto:${paymentData.agent.email}?subject=Rent Payment Inquiry`}
              className="btn-primary btn-sm"
            >
              Email
            </a>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => !processingPayment && setShowPaymentModal(false)}
        title="Make Payment"
        size="md"
      >
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Rent Amount</span>
              <span className="font-medium">{formatPrice(paymentData.currentRent.amount)}</span>
            </div>
            {paymentData.currentRent.lateFee > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Late Fee</span>
                <span className="font-medium text-red-600">{formatPrice(paymentData.currentRent.lateFee)}</span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg">
                  {formatPrice(paymentData.currentRent.amount + paymentData.currentRent.lateFee)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Select Payment Method</h3>
            <div className="space-y-2">
              {paymentData.paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === method.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <method.icon className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{method.name}</span>
                      {method.fee > 0 && (
                        <span className="text-sm text-gray-500">+{formatPrice(method.fee)} fee</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{method.processingTime}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          {selectedPaymentMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="label-text">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedPaymentMethod === 'mpesa' && (
            <div>
              <label className="label-text">M-Pesa Phone Number</label>
              <input
                type="tel"
                placeholder="+254712345678"
                className="input-field"
              />
              <p className="text-sm text-gray-500 mt-1">
                You will receive an M-Pesa prompt on this number
              </p>
            </div>
          )}

          {selectedPaymentMethod === 'bank' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Bank Transfer Details</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Account Name:</span> PropertyHub Escrow</p>
                <p><span className="font-medium">Account Number:</span> 1234567890</p>
                <p><span className="font-medium">Bank:</span> ABC Bank</p>
                <p><span className="font-medium">Reference:</span> {paymentData.property.id}-{user?.id}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              disabled={processingPayment}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={processingPayment}
              className="flex-1 btn-primary"
            >
              {processingPayment ? (
                <div className="flex items-center justify-center">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Pay ${formatPrice(paymentData.currentRent.amount + paymentData.currentRent.lateFee)}`
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RentPayments;