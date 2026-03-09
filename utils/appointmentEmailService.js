const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const sendAppointmentLetter = async (email, data) => {
    // 1. Path to your 4-page template
    const templatePath = path.join(__dirname, '../templates/appointmentLetter.ejs');

    // 2. Load Logo
    let logoBase64 = "";
    try {
        const logoPath = path.join(__dirname, '../assets/blackLogo.png');
        const bitmap = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${bitmap.toString('base64')}`;
    } catch (err) { 
        console.error("Logo missing for Appointment Letter"); 
    }

    // 3. Render HTML with your specific data
    const html = await ejs.renderFile(templatePath, {
        logo: logoBase64,
        offerId: data.offerId,
        employeeName: data.employeeName,
        fathersName: data.fathersName,
        address: data.address,
        phone: data.phone,             
        email: data.email,
        position: data.position,
        formattedSalary: Number(data.salary).toLocaleString('en-IN'),
        formattedJoiningDate: new Date(data.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        currentDate: new Date().toLocaleDateString('en-IN'),
        hrName: data.hrName
    });

    // 4. Generate PDF
    const pdfBuffer = await new Promise((resolve, reject) => {
        pdf.create(html, { format: 'A4', border: '0.4in' }).toBuffer((err, buffer) => {
            if (err) reject(err);
            else resolve(buffer);
        });
    });

    // 5. Professional Email Template
    const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
        <h2 style="color: #f27022;">Congratulations, ${data.employeeName}!</h2>
        <p>Dear <strong>${data.employeeName}</strong>,</p>
        
        <p>We are delighted to formally offer you the position of <strong>${data.position}</strong> at <strong>Viral Ads Media</strong>. We were highly impressed with your skills and experience, and we believe you will be a fantastic addition to our team.</p>
        
        <p>Please find your official <strong>Appointment Letter (Ref: ${data.offerId})</strong> attached to this email. It outlines the terms of your employment, compensation, and joining details.</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #f27022; margin: 20px 0;">
            <strong>Next Steps:</strong><br>
            1. Review the attached document carefully.<br>
            2. Sign and scan the acceptance copy.<br>
            3. Reply to this email with the signed document by <strong>${new Date(data.joiningDate).toLocaleDateString('en-IN')}</strong>.
        </div>
        
        <p>If you have any questions regarding the offer, please feel free to reach out to the HR department at this email address.</p>
        
        <p>We look forward to welcoming you to the team!</p>
        
        <p style="margin-top: 30px;">
            Best Regards,<br>
            <strong>HR Department</strong><br>
            <strong>Viral Ads Media</strong> | Digital Creative Agency
        </p>
    </div>
    `;

    // 6. Email Transport & Sending
    const transporter = nodemailer.createTransport({
       host: "smtp.titan.email",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
        await transporter.sendMail({
            from: `"Viral Ads Media HR" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Appointment Letter - ${data.employeeName} | ${data.position}`,
            html: emailHtml,
            attachments: [{
                filename: `Appointment_Letter_${data.employeeName.replace(/\s+/g, '_')}.pdf`,
                content: pdfBuffer
            }]
        });
    } catch (error) {
        console.error("Email Error:", error);
        throw new Error("Failed to send Appointment Letter email");
    }
};

module.exports = sendAppointmentLetter;