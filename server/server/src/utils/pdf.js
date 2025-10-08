// server/src/utils/pdf.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create directory if it doesn't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Generate PDF document
const generatePDF = async (options) => {
  const {
    fileName,
    outputDir = path.join(__dirname, '../../uploads/pdfs'),
    content,
    pageSize = 'A4',
    margins = { top: 50, bottom: 50, left: 50, right: 50 }
  } = options;

  ensureDirectoryExists(outputDir);

  const filePath = path.join(outputDir, fileName);
  const doc = new PDFDocument({
    size: pageSize,
    margins
  });

  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Add content to PDF
  if (typeof content === 'function') {
    content(doc);
  }

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
};

// Add header to PDF
const addHeader = (doc, title, subtitle = null) => {
  doc
    .fontSize(20)
    .text(title, { align: 'center' })
    .moveDown(0.5);

  if (subtitle) {
    doc
      .fontSize(12)
      .text(subtitle, { align: 'center' })
      .moveDown(1);
  }

  // Add line
  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke()
    .moveDown();
};

// Add footer to PDF
const addFooter = (doc, text) => {
  const bottomY = doc.page.height - 50;
  
  doc
    .fontSize(8)
    .text(text, 50, bottomY, {
      align: 'center',
      color: 'gray'
    });
};

// Add table to PDF
const addTable = (doc, data, columns, options = {}) => {
  const {
    startX = 50,
    startY = doc.y,
    columnWidth = 100,
    rowHeight = 30,
    headerBg = '#f0f0f0'
  } = options;

  let y = startY;

  // Draw header
  doc.fillColor('black');
  columns.forEach((col, i) => {
    const x = startX + (i * columnWidth);
    doc
      .rect(x, y, columnWidth, rowHeight)
      .fill(headerBg)
      .fillColor('black')
      .fontSize(10)
      .text(col.header, x + 5, y + 10, {
        width: columnWidth - 10
      });
  });

  y += rowHeight;

  // Draw rows
  data.forEach((row, rowIndex) => {
    columns.forEach((col, colIndex) => {
      const x = startX + (colIndex * columnWidth);
      
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc
          .rect(x, y, columnWidth, rowHeight)
          .fill('#ffffff');
      }
      
      doc
        .fillColor('black')
        .fontSize(9)
        .text(row[col.key] || '', x + 5, y + 10, {
          width: columnWidth - 10
        });
    });
    
    y += rowHeight;
  });

  doc.moveDown();
};

// Format currency for PDF
const formatCurrency = (amount, currency = 'KES') => {
  return `${currency} ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

// Format date for PDF
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

module.exports = {
  generatePDF,
  addHeader,
  addFooter,
  addTable,
  formatCurrency,
  formatDate,
  ensureDirectoryExists
};