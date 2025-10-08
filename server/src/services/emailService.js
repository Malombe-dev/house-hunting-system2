// server/src/services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to House Hunting System';
  const html = `
    <h1>Welcome ${user.firstName}!</h1>
    <p>Thank you for registering with our House Hunting System.</p>
    <p>Your role: ${user.role}</p>
    <p>You can now log in and start exploring properties.</p>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const subject = 'Password Reset Request';
  const html = `
    <h2>Password Reset Request</h2>
    <p>Hello ${user.firstName},</p>
    <p>You requested to reset your password. Click the link below to proceed:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html
  });
};

// Send email verification
const sendVerificationEmail = async (user, verificationToken) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  
  const subject = 'Verify Your Email Address';
  const html = `
    <h2>Email Verification</h2>
    <p>Hello ${user.firstName},</p>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="${verifyUrl}">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html
  });
};

// Send rent reminder
const sendRentReminderEmail = async (tenant, daysUntilDue) => {
  const subject = `Rent Payment Reminder - Due in ${daysUntilDue} days`;
  const html = `
    <h2>Rent Payment Reminder</h2>
    <p>Hello ${tenant.user.firstName},</p>
    <p>This is a friendly reminder that your rent payment is due in ${daysUntilDue} days.</p>
    <p>Amount: ${tenant.lease.rentAmount}</p>
    <p>Due Date: ${new Date(tenant.lease.rentDueDate).toLocaleDateString()}</p>
    <p>Please ensure timely payment to avoid late fees.</p>
  `;

  await sendEmail({
    to: tenant.user.email,
    subject,
    html
  });
};

// Send maintenance update email
const sendMaintenanceUpdateEmail = async (maintenance, user) => {
  const subject = `Maintenance Request Update - ${maintenance.title}`;
  const html = `
    <h2>Maintenance Request Update</h2>
    <p>Hello ${user.firstName},</p>
    <p>Your maintenance request has been updated:</p>
    <p><strong>Title:</strong> ${maintenance.title}</p>
    <p><strong>Status:</strong> ${maintenance.status}</p>
    <p><strong>Priority:</strong> ${maintenance.priority}</p>
    ${maintenance.scheduledDate ? `<p><strong>Scheduled Date:</strong> ${new Date(maintenance.scheduledDate).toLocaleDateString()}</p>` : ''}
    ${maintenance.notes ? `<p><strong>Notes:</strong> ${maintenance.notes}</p>` : ''}
  `;

  await sendEmail({
    to: user.email,
    subject,
    html
  });
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (payment, tenant) => {
  const subject = 'Payment Confirmation';
  const html = `
    <h2>Payment Received</h2>
    <p>Hello ${tenant.user.firstName},</p>
    <p>We have received your payment:</p>
    <p><strong>Amount:</strong> KES ${payment.amount}</p>
    <p><strong>Payment Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}</p>
    <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
    <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
    <p><strong>For Month:</strong> ${payment.forMonth}</p>
    <p>Thank you for your payment!</p>
  `;

  await sendEmail({
    to: tenant.user.email,
    subject,
    html
  });
};

// Send lease expiry reminder
const sendLeaseExpiryReminderEmail = async (tenant, daysUntilExpiry) => {
  const subject = `Lease Expiry Notice - ${daysUntilExpiry} days remaining`;
  const html = `
    <h2>Lease Expiry Reminder</h2>
    <p>Hello ${tenant.user.firstName},</p>
    <p>This is to inform you that your lease will expire in ${daysUntilExpiry} days.</p>
    <p>Expiry Date: ${new Date(tenant.lease.endDate).toLocaleDateString()}</p>
    <p>Please contact your property manager to discuss renewal options.</p>
  `;

  await sendEmail({
    to: tenant.user.email,
    subject,
    html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendRentReminderEmail,
  sendMaintenanceUpdateEmail,
  sendPaymentConfirmationEmail,
  sendLeaseExpiryReminderEmail
};