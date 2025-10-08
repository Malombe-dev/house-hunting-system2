// (utils/sendEmail.js)
const nodemailer = require('nodemailer');

exports.sendVerificationEmail = async (to, link) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your email',
    html: `
      <p>Welcome! Please verify your email by clicking below:</p>
      <a href="${link}" target="_blank" 
        style="background:#4CAF50;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
