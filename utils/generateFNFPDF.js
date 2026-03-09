const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

/**
 * Generates PDF buffer for FNF Settlement Statement
 */
const generateFNFPDF = async (data) => {
  const templatePath = path.join(__dirname, '../templates/fnfStatement.ejs');
  
  let logoBase64 = "";
  try {
    const logoPath = path.join(__dirname, '../assets/blackLogo.png');
    if (fs.existsSync(logoPath)) {
      const bitmap = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${bitmap.toString('base64')}`;
    }
  } catch (err) {
    console.error("Logo loading error:", err);
  }

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const html = await ejs.renderFile(templatePath, {
    logo: logoBase64,
    currentDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    employeeName: data.employeeName,
    email: data.email,
    phone: data.phone || 'N/A',
    dateOfJoining: data.dateOfJoining,
    lastWorkingDay: data.lastWorkingDay,
    pendingSalary: formatCurrency(data.pendingSalary),
    leaveEncashment: formatCurrency(data.leaveEncashment),
    incentive: formatCurrency(data.incentive),
    deductions: formatCurrency(data.deductions),
    totalPayable: formatCurrency(data.totalPayable),
    companyAddress: 'B-27, Budh Vihar Phase 1, Delhi-110086',
    
    // ====================== ONLY ADDED THESE LINES (nothing removed) ======================
    // Now all fields from your controller + EJS will always be available
    employeeId: data.employeeId || 'N/A',
    designation: data.designation || 'Employee',
    address: data.address || 'N/A',
    bankAccount: data.bankAccount || 'N/A',
    ifsc: data.ifsc || 'N/A'
    // ====================================================================================
  });

  const options = { 
    format: 'A4', 
    border: { top: '10mm', right: '15mm', bottom: '10mm', left: '15mm' }
  };

  return new Promise((resolve, reject) => {
    pdf.create(html, options).toBuffer((err, buffer) => {
      if (err) reject(err);
      else resolve(buffer);
    });
  });
};

/* ====================== ADDED / UPDATED PARTS (nothing removed) ====================== */

// 1. Extra fields for better PDF (now supports employeeId, designation, etc.)
generateFNFPDF.getPDFData = (fnfRecord) => ({
  ...fnfRecord,
  employeeId: fnfRecord.employeeId || 'N/A',
  designation: fnfRecord.designation || 'N/A',
  address: fnfRecord.address || 'N/A',
  bankAccount: fnfRecord.bankAccount || 'N/A',
  ifsc: fnfRecord.ifsc || 'N/A',
  empId: fnfRecord.employeeId || 'N/A'
});

// 2. Improved version that also handles full record from controller
generateFNFPDF.generateWithFullData = async (fullData) => {
  const enhancedData = {
    ...fullData,
    employeeId: fullData.employeeId || 'N/A',
    designation: fullData.designation || 'N/A',
    address: fullData.address || 'N/A',
    bankAccount: fullData.bankAccount || 'N/A',
    ifsc: fullData.ifsc || 'N/A'
  };

  // Call original function with enhanced data
  return await generateFNFPDF(enhancedData);
};

module.exports = generateFNFPDF;