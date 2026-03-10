const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const generatePDF = async (data) => {
  const templatePath = path.join(__dirname, '../templates/offerLetter.ejs');
  
  // 1. Load Logo and convert to Base64
  let logoBase64 = "";
  try {
    const logoPath = path.join(__dirname, '../assets/blackLogo.png');
    const bitmap = fs.readFileSync(logoPath);
    // Use proper MIME type for PNG
    logoBase64 = `data:image/png;base64,${bitmap.toString('base64')}`;
  } catch (err) {
    console.error("LOGO ERROR: Ensure logo is at backend/assets/blackLogo.png");
  }

  const html = await ejs.renderFile(templatePath, {
    logo: logoBase64,
    offerId: data.offerId,
    employeeName: data.employeeName,
    fathersName: data.fathersName, 
    address: data.address,
    phoneNumber: data.phoneNumber, 
    emailId: data.emailId,         
    position: data.position,
    salary: data.salary,
    hrName: data.hrName,
    formattedSalary: Number(data.salary).toLocaleString('en-IN'),
    formattedJoiningDate: new Date(data.joiningDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }),
    currentDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
});

  const options = { 
    format: 'A4', 
    border: { top: '0px', right: '20mm', bottom: '20mm', left: '20mm' },
    // Lower quality values can blur logos; keep default or use 300 for print
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

module.exports = generatePDF;