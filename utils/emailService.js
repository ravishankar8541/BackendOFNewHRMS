const nodemailer = require('nodemailer');

// Create transporter with Titan SMTP (STARTTLS - port 587)
// IMPORTANT NOTE (March 2026): Render FREE tier blocks outbound SMTP ports 25/465/587 since Sep 2025.
// This code will timeout/hang on free tier → upgrade to paid Render plan OR switch to email API (Resend/Brevo/SendGrid).
const transporter = nodemailer.createTransport({
  host: 'smtp.titan.email',
  port: 587,
  secure: false,                    // false = STARTTLS (recommended for Titan in cloud)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Connection timeouts - increased to avoid hanging in production
  connectionTimeout: 30000,         // 30 seconds
  greetingTimeout: 20000,
  socketTimeout: 30000,
  // Debug mode - very helpful during development & first production tests
  logger: true,
  debug: true,
  // Optional: helps with self-signed / chain issues (remove after testing)
  tls: {
    rejectUnauthorized: true,       // Set to false temporarily ONLY if you get certificate errors
  },
});

// Verify transporter once on startup (logs success or failure)
// On Render free → this will fail with timeout/connection error
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Transporter (Titan SMTP) is ready');
  }
});

const sendOfferLetter = async (to, offer) => {
  try {
    // 1. Generate PDF
    console.log(`[EMAIL] Generating PDF for offer ${offer.offerId} to ${to}`);
    const pdfBuffer = await require('./pdfGenerator')(offer);
    console.log(`[EMAIL] PDF generated successfully (${pdfBuffer.length} bytes)`);

    // 2. Build professional HTML email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f27022;">Congratulations, ${offer.employeeName}!</h2>
        <p>Dear <strong>${offer.employeeName}</strong>,</p>
        
        <p>We are delighted to formally offer you the position of <strong>${offer.position}</strong> at <strong>Viral Ads Media</strong>. We were highly impressed with your skills and experience, and we believe you will be a fantastic addition to our team.</p>
        
        <p>Please find your official <strong>Offer Letter (Ref: ${offer.offerId})</strong> attached to this email. It outlines the terms of your employment, compensation, and joining details.</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #f27022; margin: 20px 0;">
          <strong>Next Steps:</strong><br>
          1. Review the attached document carefully.<br>
          2. Sign and scan the acceptance copy.<br>
          3. Reply to this email with the signed document by <strong>${new Date(offer.joiningDate).toLocaleDateString('en-IN')}</strong>.
        </div>
        
        <p>If you have any questions regarding the offer, please feel free to reach out to the HR department.</p>
        
        <p>We look forward to welcoming you to the team!</p>
        
        <p style="margin-top: 30px;">
          Best Regards,<br>
          <strong>HR Department</strong><br>
          Viral Ads Media | Digital Creative Agency
        </p>
      </div>
    `;

    // 3. Mail options
    const mailOptions = {
      from: `"Viral Ads Media HR" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Job Offer: ${offer.position} | ${offer.employeeName}`,
      html: emailHtml,
      attachments: [{
        filename: `Offer_Letter_${offer.employeeName.replace(/\s+/g, '_')}.pdf`,
        content: pdfBuffer,
      }],
    };

    // 4. Safety check
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Missing EMAIL_USER or EMAIL_PASS environment variables');
    }

    console.log(`[EMAIL] Attempting to send to ${to} from ${process.env.EMAIL_USER}`);

    // 5. Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`[EMAIL SUCCESS] Sent to ${to} - Message ID: ${info.messageId}`);
    return info;

  } catch (error) {
    console.error('=== EMAIL SEND FAILED ===');
    console.error('To:', to);
    console.error('Offer ID:', offer?.offerId);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code || 'N/A');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('SMTP server response:', error.response);
    }
    console.error('Full error:', error);
    console.error('Stack:', error.stack);

    // Improved message for client (shows root cause hint if known)
    const clientMessage = error.code === 'ETIMEDOUT' || error.message?.includes('timeout')
      ? 'Failed to send email: Connection timeout (likely Render free tier SMTP block - upgrade plan or use email API)'
      : `Failed to send email: ${error.message || 'Unknown error'}`;

    throw new Error(clientMessage);
  }
};

module.exports = sendOfferLetter;