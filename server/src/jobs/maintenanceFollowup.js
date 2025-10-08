// server/src/jobs/maintenanceFollowup.js
const cron = require('node-cron');
const Maintenance = require('../models/Maintenance');
const { sendMaintenanceUpdateEmail } = require('../services/emailService');
const { notifyMaintenanceUpdate } = require('../services/notificationService');

// Follow up on pending maintenance requests
const followUpPendingRequests = async () => {
  try {
    console.log('Running maintenance follow-up job...');
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find pending requests older than 3 days
    const pendingRequests = await Maintenance.find({
      status: 'pending',
      createdAt: { $lt: threeDaysAgo }
    })
      .populate('property')
      .populate({
        path: 'tenant',
        populate: { path: 'user' }
      })
      .populate('createdBy');

    for (const request of pendingRequests) {
      // TODO: Notify property manager/agent
      console.log(`Pending maintenance request: ${request.title} (${request._id})`);
    }

    console.log(`Found ${pendingRequests.length} pending maintenance requests`);
  } catch (error) {
    console.error('Maintenance follow-up error:', error);
  }
};

// Check for overdue scheduled maintenance
const checkOverdueScheduled = async () => {
  try {
    console.log('Checking for overdue scheduled maintenance...');
    
    const currentDate = new Date();

    const overdueRequests = await Maintenance.find({
      status: 'assigned',
      scheduledDate: { $lt: currentDate }
    })
      .populate('property')
      .populate('assignedTo')
      .populate({
        path: 'tenant',
        populate: { path: 'user' }
      });

    for (const request of overdueRequests) {
      // TODO: Send alert to assigned technician and property manager
      console.log(`Overdue maintenance: ${request.title} (${request._id})`);
    }

    console.log(`Found ${overdueRequests.length} overdue maintenance requests`);
  } catch (error) {
    console.error('Overdue scheduled check error:', error);
  }
};

// Auto-close completed maintenance requests
const autoCloseCompleted = async () => {
  try {
    console.log('Auto-closing old completed maintenance requests...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Maintenance.updateMany(
      {
        status: 'completed',
        completedAt: { $lt: thirtyDaysAgo }
      },
      {
        $set: { status: 'closed' }
      }
    );

    console.log(`Auto-closed ${result.modifiedCount} maintenance requests`);
  } catch (error) {
    console.error('Auto-close error:', error);
  }
};

// Schedule maintenance follow-up jobs
const scheduleMaintenanceJobs = () => {
  // Follow up on pending requests daily at 2:00 PM
  cron.schedule('0 14 * * *', followUpPendingRequests, {
    timezone: 'Africa/Nairobi'
  });

  // Check overdue scheduled maintenance daily at 8:00 AM
  cron.schedule('0 8 * * *', checkOverdueScheduled, {
    timezone: 'Africa/Nairobi'
  });

  // Auto-close completed requests weekly on Sundays at 11:00 PM
  cron.schedule('0 23 * * 0', autoCloseCompleted, {
    timezone: 'Africa/Nairobi'
  });

  console.log('Maintenance follow-up jobs scheduled');
};

module.exports = {
  followUpPendingRequests,
  checkOverdueScheduled,
  autoCloseCompleted,
  scheduleMaintenanceJobs
};