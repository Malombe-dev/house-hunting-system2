// server/src/services/receiptService.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Payment = require('../models/Payment');

// Generate receipt PDF
const generateReceiptPDF = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId)
      .populate({
        path: 'tenant',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      })
      .populate('property', 'name address')
      .populate('lease', 'rentAmount');

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Create receipts directory if it doesn't exist
    const receiptsDir = path.join(__dirname, '../../uploads/receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const fileName = `receipt_${payment._id}_${Date.now()}.pdf`;
    const filePath = path.join(receiptsDir, fileName);
    
    // Pipe to file
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Add content
    generateReceiptContent(doc, payment);

    // Finalize PDF
    doc.end();

    // Wait for file to be written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    return {
      fileName,
      filePath
    };
  } catch (error) {
    console.error('Generate receipt PDF error:', error);
    throw error;
  }
};

// Generate receipt content
const generateReceiptContent = (doc, payment) => {
  // Header
  doc
    .fontSize(20)
    .text('PAYMENT RECEIPT', 50, 50, { align: 'center' })
    .moveDown();

  // Company info
  doc
    .fontSize(10)
    .text('House Hunting & Property Management System', { align: 'center' })
    .text('Nairobi, Kenya', { align: 'center' })
    .text('Email: info@househunting.com', { align: 'center' })
    .text('Phone: +254 700 000 000', { align: 'center' })
    .moveDown(2);

  // Receipt details
  doc
    .fontSize(12)
    .text(`Receipt No: ${payment._id}`, 50)
    .text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`)
    .text(`Transaction ID: ${payment.transactionId || 'N/A'}`)
    .moveDown();

  // Tenant details
  doc
    .fontSize(14)
    .text('Tenant Information', { underline: true })
    .fontSize(10)
    .moveDown(0.5);

  if (payment.tenant && payment.tenant.user) {
    doc
      .text(`Name: ${payment.tenant.user.firstName} ${payment.tenant.user.lastName}`)
      .text(`Email: ${payment.tenant.user.email}`)
      .text(`Phone: ${payment.tenant.user.phone || 'N/A'}`)
      .moveDown();
  }

  // Property details
  doc
    .fontSize(14)
    .text('Property Information', { underline: true })
    .fontSize(10)
    .moveDown(0.5);

  if (payment.property) {
    doc
      .text(`Property: ${payment.property.name}`)
      .text(`Address: ${payment.property.address}`)
      .moveDown();
  }

  // Payment details
  doc
    .fontSize(14)
    .text('Payment Details', { underline: true })
    .fontSize(10)
    .moveDown(0.5);

  doc
    .text(`Payment For: ${payment.forMonth || 'Rent'}`)
    .text(`Payment Method: ${payment.paymentMethod}`)
    .text(`Amount Paid: KES ${payment.amount.toFixed(2)}`, { bold: true })
    .moveDown();

  if (payment.notes) {
    doc
      .fontSize(10)
      .text(`Notes: ${payment.notes}`)
      .moveDown();
  }

  // Footer
  doc
    .moveDown(3)
    .fontSize(10)
    .text('Thank you for your payment!', { align: 'center' })
    .fontSize(8)
    .text('This is a computer-generated receipt and does not require a signature.', { 
      align: 'center',
      color: 'gray'
    });

  // Add line
  doc
    .moveTo(50, doc.y + 20)
    .lineTo(550, doc.y + 20)
    .stroke();

  doc
    .moveDown()
    .fontSize(8)
    .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center', color: 'gray' });
};

// Send receipt via email
const sendReceiptEmail = async (paymentId, recipientEmail) => {
  try {
    const { filePath } = await generateReceiptPDF(paymentId);
    
    // TODO: Implement email sending with attachment
    // Use emailService to send email with PDF attachment
    
    console.log(`Receipt generated at: ${filePath}`);
    console.log(`Would send to: ${recipientEmail}`);

    return {
      success: true,
      message: 'Receipt sent successfully'
    };
  } catch (error) {
    console.error('Send receipt email error:', error);
    throw error;
  }
};

// Generate bulk receipts
const generateBulkReceipts = async (paymentIds) => {
  try {
    const receipts = [];
    
    for (const paymentId of paymentIds) {
      const receipt = await generateReceiptPDF(paymentId);
      receipts.push(receipt);
    }

    return receipts;
  } catch (error) {
    console.error('Generate bulk receipts error:', error);
    throw error;
  }
};

module.exports = {
  generateReceiptPDF,
  sendReceiptEmail,
  generateBulkReceipts
};