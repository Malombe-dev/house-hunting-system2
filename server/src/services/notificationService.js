// server/src/services/notificationService.js
const Notification = require('../models/Notification');

// Create notification
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// Send notification to user
const sendNotification = async (userId, title, message, type = 'info', link = null) => {
  try {
    const notification = await createNotification({
      user: userId,
      title,
      message,
      type,
      link
    });

    // TODO: Implement real-time notification using Socket.io
    // io.to(userId).emit('notification', notification);

    return notification;
  } catch (error) {
    console.error('Send notification error:', error);
    throw error;
  }
};

// Send bulk notifications
const sendBulkNotifications = async (userIds, title, message, type = 'info', link = null) => {
  try {
    const notifications = userIds.map(userId => ({
      user: userId,
      title,
      message,
      type,
      link
    }));

    const created = await Notification.insertMany(notifications);

    // TODO: Implement real-time notifications
    // userIds.forEach(userId => {
    //   io.to(userId).emit('notification', { title, message, type, link });
    // });

    return created;
  } catch (error) {
    console.error('Send bulk notifications error:', error);
    throw error;
  }
};

// Mark notification as read
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );

    return notification;
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );

    return { message: 'All notifications marked as read' };
  } catch (error) {
    console.error('Mark all as read error:', error);
    throw error;
  }
};

// Get user notifications
const getUserNotifications = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    
    const query = { user: userId };
    if (unreadOnly) query.read = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    return {
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Get user notifications error:', error);
    throw error;
  }
};

// Delete notification
const deleteNotification = async (notificationId, userId) => {
  try {
    await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });

    return { message: 'Notification deleted successfully' };
  } catch (error) {
    console.error('Delete notification error:', error);
    throw error;
  }
};

// Delete old notifications (cleanup job)
const deleteOldNotifications = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      read: true
    });

    return { 
      message: 'Old notifications deleted',
      count: result.deletedCount 
    };
  } catch (error) {
    console.error('Delete old notifications error:', error);
    throw error;
  }
};

// Notification types and messages
const NotificationTypes = {
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_DUE: 'payment_due',
  PAYMENT_OVERDUE: 'payment_overdue',
  MAINTENANCE_CREATED: 'maintenance_created',
  MAINTENANCE_UPDATED: 'maintenance_updated',
  MAINTENANCE_COMPLETED: 'maintenance_completed',
  LEASE_EXPIRING: 'lease_expiring',
  LEASE_EXPIRED: 'lease_expired',
  PROPERTY_APPROVED: 'property_approved',
  PROPERTY_REJECTED: 'property_rejected',
  REVIEW_POSTED: 'review_posted',
  ACCOUNT_APPROVED: 'account_approved',
  ACCOUNT_SUSPENDED: 'account_suspended'
};

// Helper functions for specific notification types
const notifyPaymentReceived = async (tenantUserId, paymentAmount, forMonth) => {
  return await sendNotification(
    tenantUserId,
    'Payment Received',
    `Your payment of KES ${paymentAmount} for ${forMonth} has been received and confirmed.`,
    'success',
    '/payments/history'
  );
};

const notifyPaymentDue = async (tenantUserId, amount, dueDate) => {
  return await sendNotification(
    tenantUserId,
    'Rent Payment Due',
    `Your rent payment of KES ${amount} is due on ${new Date(dueDate).toLocaleDateString()}.`,
    'warning',
    '/payments'
  );
};

const notifyMaintenanceUpdate = async (userId, maintenanceId, status) => {
  return await sendNotification(
    userId,
    'Maintenance Request Updated',
    `Your maintenance request status has been updated to: ${status}`,
    'info',
    `/maintenance/${maintenanceId}`
  );
};

const notifyLeaseExpiring = async (tenantUserId, daysRemaining) => {
  return await sendNotification(
    tenantUserId,
    'Lease Expiring Soon',
    `Your lease will expire in ${daysRemaining} days. Please contact your property manager.`,
    'warning',
    '/lease'
  );
};

const notifyPropertyApproved = async (agentUserId, propertyName) => {
  return await sendNotification(
    agentUserId,
    'Property Approved',
    `Your property "${propertyName}" has been approved and is now visible to seekers.`,
    'success',
    '/properties'
  );
};

module.exports = {
  createNotification,
  sendNotification,
  sendBulkNotifications,
  markAsRead,
  markAllAsRead,
  getUserNotifications,
  deleteNotification,
  deleteOldNotifications,
  NotificationTypes,
  notifyPaymentReceived,
  notifyPaymentDue,
  notifyMaintenanceUpdate,
  notifyLeaseExpiring,
  notifyPropertyApproved
};