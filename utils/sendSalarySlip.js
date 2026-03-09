const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const sendSalarySlip = async (email, data) => {
  try {
    const templatePath = path.join(__dirname, '../templates/salarySlip.ejs');

    // Load logo as base64
    let logoBase64 = "";
    try {
      const logoPath = path.join(__dirname, '../assets/blackLogo.png');
      const bitmap = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${bitmap.toString('base64')}`;
    } catch (err) {
      console.error("Logo missing at backend/assets/blackLogo.png");
      // Continue without logo - not fatal
    }

    // Render EJS template with all fields from data (matches frontend & controller)
    const html = await ejs.renderFile(templatePath, {
      logo: logoBase64,
      companyName: 'VIRAL ADS MEDIA',
      companyAddress: 'B-27, Budh Vihar Phase 1, New Delhi-110086',
      payMonth: data.monthYear || '—',
        netPayWords: data.netPayWords || "",
      employeeName: data.employeeName || '—',
      employeeId: data.employeeId || '—',
      designation: data.designation || '—',
      joiningDate: data.joiningDate || '—',
      panNumber: data.panNumber || '—',
      aadharNumber: data.aadharNumber || '—',
      bankAccount: data.bankAccount || '—',
      ifsc: data.ifsc || '—', 
      phone: data.phone || '—',                  // optional

      workingDays: data.workingDays || 30,
      lopDays: data.lopDays || 0,

      basicSalary: Number(data.basicSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      allowance: Number(data.allowance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      bonus: Number(data.bonus || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      lopAmount: Number(data.lopAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      pfDeduction: Number(data.pfDeduction || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      otherDeduction: Number(data.otherDeduction || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      grossEarnings: Number(data.grossEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      totalDeductions: Number(data.totalDeductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      netPayable: Number(data.netPayable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),

      // Optional - can be passed from controller or left blank
      hrName: 'Authorised Signatory'
    });

    // Generate PDF buffer
    const pdfBuffer = await new Promise((resolve, reject) => {
      const options = {
        format: 'A4',
        border: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm'
        },
        quality: '100'
      };

      pdf.create(html, options).toBuffer((err, buffer) => {
        if (err) reject(err);
        else resolve(buffer);
      });
    });

    // Nodemailer setup
   
   
   
   const transporter = nodemailer.createTransport({
       host: "smtp.titan.email",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Safe filename
    const safeName = (data.employeeName || "Employee").replace(/[^a-zA-Z0-9]/g, '_');
    const safeMonth = (data.monthYear || "Period").replace(/[^a-zA-Z0-9]/g, '-');

    // Send email
    await transporter.sendMail({
      from: `"Viral Ads Media Payroll" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Payslip - ${data.monthYear || 'Current Period'} | ${data.employeeName || 'Employee'}`,
      html: `
        <p>Dear ${data.employeeName || 'Employee'},</p>
        <p>Your salary payslip for <strong>${data.monthYear || 'the period'}</strong> is attached.</p>
        <p>Regards,<br>Viral Ads Media HR Team</p>
      `,
      attachments: [{
        filename: `Payslip_${safeName}_${safeMonth}.pdf`,
        content: pdfBuffer
      }]
    });

    console.log(`Payslip email sent to ${email}`);
    return true;

  } catch (error) {
    console.error('Error in sendSalarySlip:', error);
    throw error;
  }
};

module.exports = sendSalarySlip;