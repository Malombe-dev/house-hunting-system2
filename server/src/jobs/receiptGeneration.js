// server/src/jobs/receiptGeneration.js
const cron = require('node-cron');
const Payment = require('../models/Payment');
const Receipt = require('../models/Receipt');
const { generateReceiptPDF, sendReceiptEmail } = require('../services/receiptService');

// Auto-generate receipts for completed payments
const autoGenerateReceipts = async () => {
  try {
    console.log('Running receipt generation job...');

    // Find payments without receipts
    const paymentsWithoutReceipts = await Payment.find({
      status: 'completed'
    }).populate({
      path: 'tenant',
      populate: {
        path: 'user',
        select: 'email firstName lastName'
      }
    });

    let generatedCount = 0;

    for (const payment of paymentsWithoutReceipts) {
      // Check if receipt already exists
      const existingReceipt = await Receipt.findOne({ payment: payment._id });
      
      if (!existingReceipt) {
        try {
          // Generate PDF receipt
          const { fileName, filePath } = await generateReceiptPDF(payment._id);

          // Create receipt record
          const receipt = new Receipt({
            payment: payment._id,
            tenant: payment.tenant._id,
            property: payment.property,
            amount: payment.amount,
            forMonth: payment.forMonth,
            pdfUrl: filePath,
            issuedBy: payment.recordedBy
          });

          await receipt.save();

          // Send receipt via email
          if (payment.tenant && payment.tenant.user && payment.tenant.user.email) {
            await sendReceiptEmail(payment._id, payment.tenant.user.email);
            receipt.emailSent = true;
            receipt.emailSentAt = new Date();
            await receipt.save();
          }

          generatedCount++;
          console.log(`Receipt generated for payment: ${payment._id}`);
        } catch (error) {
          console.error(`Error generating receipt for payment ${payment._id}:`, error);
        }
      }
    }

    console.log(`Receipt generation completed. Generated ${generatedCount} receipts.`);
  } catch (error) {
    console.error('Receipt generation job error:', error);
  }
};

// Schedule receipt generation job
const scheduleReceiptGeneration = () => {
  // Run daily at 11:00 PM
  cron.schedule('0 23 * * *', autoGenerateReceipts, {
    timezone: 'Africa/Nairobi'
  });

  console.log('Receipt generation job scheduled (daily at 11:00 PM)');
};

// Generate monthly receipts summary
const generateMonthlyReceiptsSummary = async () => {
  try {
    console.log('Generating monthly receipts summary...');

    const currentMonth = new Date().toISOString().slice(0, 7);

    const receipts = await Receipt.find({
      forMonth: currentMonth
    }).populate('tenant property');

    const summary = {
      month: currentMonth,
      totalReceipts: receipts.length,
      totalAmount: receipts.reduce((sum, r) => sum + r.amount, 0),
      emailsSent: receipts.filter(r => r.emailSent).length,
      receipts: receipts
    };

    console.log(`Monthly summary: ${summary.totalReceipts} receipts, KES ${summary.totalAmount}`);

    return summary;
  } catch (error) {
    console.error('Monthly summary error:', error);
    throw error;
  }
};

module.exports = {
  autoGenerateReceipts,
  scheduleReceiptGeneration,
  generateMonthlyReceiptsSummary
};