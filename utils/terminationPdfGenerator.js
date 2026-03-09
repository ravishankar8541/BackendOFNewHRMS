const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

/**
 * Generates PDF buffer for Termination Letter using html-pdf
 * @param {Object} data 
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateTerminationPDF = async (data) => {
  const templatePath = path.join(__dirname, '../templates/terminationLetter.ejs');
  
  // 1. Load Logo and convert to Base64 (Ensures visibility in PDF) 
  let logoBase64 = "";
  try {
    const logoPath = path.join(__dirname, '../assets/blackLogo.png');
    const bitmap = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${bitmap.toString('base64')}`;
  } catch (err) {
    console.error("LOGO ERROR: Ensure logo is at backend/assets/blackLogo.png");
  }

  // 2. Render HTML with specific Termination Letter fields [cite: 15-28]
  const html = await ejs.renderFile(templatePath, {
    logo: logoBase64,
    noticeDate: formatDate(data.noticeDate || new Date()), // Matches "28 February 2026" style [cite: 15]
    name: data.name || data.employeeName, // [cite: 17]
    email: data.email || 'N/A', // [cite: 18]
    contact: data.phoneNumber || 'N/A', // [cite: 19]
    designation: data.designation,
    lastWorkingDate: formatDate(data.lastWorkingDate), // [cite: 22]
    reason: data.reason || 'Not work Proper in the Office', // [cite: 23]
    hrName: data.hrName || 'HR Manager', // [cite: 26]
    companyAddress: 'B-27, Budh Vihar Phase 1, Delhi-110086' // [cite: 28]
  });

  // 3. PDF Options matching your previous design
  const options = { 
    format: 'A4', 
    border: { top: '10mm', right: '20mm', bottom: '20mm', left: '20mm' },
    type: "pdf",
    quality: "100"
  };

  return new Promise((resolve, reject) => {
    pdf.create(html, options).toBuffer((err, buffer) => {
      if (err) reject(err);
      else resolve(buffer);
    });
  });
};

/**
 * Helper to format dates exactly like the source PDF: "28 February 2026" [cite: 15]
 */
function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

module.exports = generateTerminationPDF;