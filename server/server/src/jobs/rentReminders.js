// server/src/jobs/rentReminders.js
const cron = require('node-cron');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const { sendRentReminderEmail } = require('../services/emailService');
const { notifyPaymentDue } = require('../services/notificationService');

// Send rent reminders
const sendRentReminders = async () => {
  try {
    console.log('Running rent reminder job...');
    
    const currentDate = new Date();
    const reminderDays = [7, 3, 1]; // Send reminders 7, 3, and 1 days before due date

    // Get all active tenants
    const tenants = await Tenant.find({ status: 'active' })
      .populate('user')
      .populate('lease');

    for (const tenant of tenants) {
      if (!tenant.lease || !tenant.lease.rentDueDay) continue;

      // Calculate next due date
      const dueDay = tenant.lease.rentDueDay;
      const nextDueDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        dueDay
      );

      // If due date has passed this month, set to next month
      if (nextDueDate < currentDate) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }

      // Calculate days until due
      const daysUntilDue = Math.ceil(
        (nextDueDate - currentDate) / (1000 * 60 * 60 * 24)
      );

      // Check if we should send reminder
      if (reminderDays.includes(daysUntilDue)) {
        // Check if payment already made for this month
        const currentMonth = new Date().toISOString().slice(0, 7);
        const paymentExists = await Payment.findOne({
          tenant: tenant._id,
          forMonth: currentMonth,
          status: 'completed'
        });

        if (!paymentExists) {
          // Send email reminder
          await sendRentReminderEmail(tenant, daysUntilDue);

          // Send in-app notification
          await notifyPaymentDue(
            tenant.user._id,
            tenant.lease.rentAmount,
            nextDueDate
          );

          console.log(`Rent reminder sent to ${tenant.user.email} (${daysUntilDue} days)`);
        }
      }
    }

    console.log('Rent reminder job completed');
  } catch (error) {
    console.error('Rent reminder job error:', error);
  }
};

// Schedule job to run daily at 9:00 AM
const scheduleRentReminders = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', sendRentReminders, {
    timezone: 'Africa/Nairobi'
  });

  console.log('Rent reminder job scheduled (daily at 9:00 AM)');
};

// Check for overdue payments
const checkOverduePayments = async () => {
  try {
    console.log('Checking for overdue payments...');
    
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);

    const tenants = await Tenant.find({ status: 'active' })
      .populate('user')
      .populate('lease');

    for (const tenant of tenants) {
      if (!tenant.lease || !tenant.lease.rentDueDay) continue;

      const dueDay = tenant.lease.rentDueDay;
      const dueDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        dueDay
      );

      // If payment is overdue (past due date)
      if (currentDate > dueDate) {
        const paymentExists = await Payment.findOne({
          tenant: tenant._id,
          forMonth: currentMonth,
          status: 'completed'
        });

        if (!paymentExists) {
          const daysOverdue = Math.ceil(
            (currentDate - dueDate) / (1000 * 60 * 60 * 24)
          );

          // TODO: Send overdue payment notification
          console.log(`Overdue: ${tenant.user.email} - ${daysOverdue} days`);
        }
      }
    }

    console.log('Overdue payment check completed');
  } catch (error) {
    console.error('Overdue payment check error:', error);
  }
};

// Schedule overdue check daily at 10:00 AM
const scheduleOverdueCheck = () => {
  cron.schedule('0 10 * * *', checkOverduePayments, {
    timezone: 'Africa/Nairobi'
  });

  console.log('Overdue payment check scheduled (daily at 10:00 AM)');
};

module.exports = {
  sendRentReminders,
  checkOverduePayments,
  scheduleRentReminders,
  scheduleOverdueCheck
};