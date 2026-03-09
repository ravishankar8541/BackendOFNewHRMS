const nodemailer = require('nodemailer');
const generateFNFPDF = require('./generateFNFPDF'); // Import the generator we just made

const transporter = nodemailer.createTransport({
       host: "smtp.titan.email",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

/**
 * Sends a Full & Final Settlement Statement email with PDF attachment
 * @param {string} to - Recipient email address
 * @param {Object} data - Employee and FNF details
 */
const sendFNFEmail = async (to, data) => {
  // 1. Generate the PDF Buffer
  // This ensures the employee gets a formal document for their records
  const pdfBuffer = await generateFNFPDF(data);

  // 2. Formatting helper for the email body
  const formatCurrency = (num) => 
    new Number(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  // 3. FNF Email Template
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
      <h2 style="color: #f27022; border-bottom: 2px solid #f27022; padding-bottom: 10px;">Full & Final Settlement Statement</h2>
      <p>Dear <strong>${data.employeeName}</strong>,</p>
      
      <p>Please find attached the official <strong>Full & Final Settlement (FNF)</strong> statement regarding your employment with <strong>Viral Ads Media</strong>.</p>
      
      <div style="background: #fff5f0; padding: 15px; border-left: 4px solid #f27022; margin: 20px 0;">
        <strong style="color: #f27022;">Settlement Summary:</strong><br>
        Total Payable: <strong>₹ ${formatCurrency(data.totalPayable)}</strong><br>
        Last Working Day: ${data.lastWorkingDay}
      </div>
      
      <p>The final amount will be processed and credited to your registered bank account as per the company's standard payout cycle (usually 7-10 working days).</p>
      
      <p>For any queries related to your dues, please feel free to reach out to the accounts department.</p>
      
      <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
        Regards,<br>
        <strong>HR & Accounts Department</strong><br>
        <strong>Viral Ads Media</strong> | Digital Creative Agency<br>
        B-27, Budh Vihar Phase 1, Delhi-110086 
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"Viral Ads Media Accounts" <${process.env.EMAIL_USER}>`,
    to,
    subject: `FNF Settlement Statement | ${data.employeeName}`,
    html: emailHtml,
    attachments: [{
      filename: `FNF_Statement_${data.employeeName.replace(/\s+/g, '_')}.pdf`,
      content: pdfBuffer,
    }],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("FNF Email Error:", error);
    throw new Error("Failed to send FNF email: " + error.message);
  }
};

module.exports = sendFNFEmail;