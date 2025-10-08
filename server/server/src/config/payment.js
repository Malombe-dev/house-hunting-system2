// server/src/config/payment.js
module.exports = {
    // M-Pesa Configuration
    mpesa: {
      consumerKey: process.env.MPESA_CONSUMER_KEY,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET,
      shortCode: process.env.MPESA_SHORTCODE,
      passKey: process.env.MPESA_PASSKEY,
      callbackUrl: process.env.MPESA_CALLBACK_URL || `${process.env.BASE_URL}/api/payments/mpesa/callback`,
      environment: process.env.MPESA_ENVIRONMENT || 'sandbox', // 'sandbox' or 'production'
      
      // API URLs
      urls: {
        sandbox: {
          oauth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
          stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
          query: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
        },
        production: {
          oauth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
          stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
          query: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
        }
      }
    },
  
    // Payment methods
    paymentMethods: {
      MPESA: 'mpesa',
      BANK_TRANSFER: 'bank_transfer',
      CASH: 'cash',
      CHEQUE: 'cheque'
    },
  
    // Payment status
    paymentStatus: {
      PENDING: 'pending',
      COMPLETED: 'completed',
      FAILED: 'failed',
      CANCELLED: 'cancelled'
    },
  
    // Late payment settings
    latePayment: {
      gracePeriodDays: 3,
      lateFeePercentage: 5, // 5% of rent
      maxLateFee: 5000 // Maximum late fee in KES
    },
  
    // Receipt settings
    receipt: {
      prefix: 'RCP',
      format: 'pdf',
      autoGenerate: true,
      emailCopy: true
    },
  
    // Currency
    currency: {
      code: 'KES',
      symbol: 'KSh',
      locale: 'en-KE'
    }
  };