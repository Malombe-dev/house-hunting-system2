// server/src/config/email.js
module.exports = {
    // SMTP Configuration
    smtp: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true' || false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    },
  
    // Email defaults
    defaults: {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'House Hunting System',
        address: process.env.EMAIL_FROM || 'noreply@househunting.com'
      }
    },
  
    // Email templates configuration
    templates: {
      welcome: {
        subject: 'Welcome to House Hunting System'
      },
      passwordReset: {
        subject: 'Password Reset Request',
        expiry: '1 hour'
      },
      emailVerification: {
        subject: 'Verify Your Email Address',
        expiry: '24 hours'
      },
      rentReminder: {
        subject: 'Rent Payment Reminder'
      },
      maintenanceUpdate: {
        subject: 'Maintenance Request Update'
      },
      paymentConfirmation: {
        subject: 'Payment Confirmation'
      },
      leaseExpiry: {
        subject: 'Lease Expiry Notice'
      }
    },
  
    // Notification settings
    notifications: {
      enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true' || true,
      rentReminderDays: [7, 3, 1], // Days before due date
      leaseExpiryDays: [60, 30, 14, 7] // Days before expiry
    }
  };