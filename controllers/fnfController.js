const FNF = require('../models/FNF');
const sendFNFEmailService = require('../utils/fnfEmailService');

/**
 * Create a new FNF record
 * @route   POST /api/fnf
 */
const createFNFRecord = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      email,
      phone,
      dateOfJoining,
      lastWorkingDay,
      pendingSalary,
      leaveEncashment = "0",
      incentive = "0",
      deductions = "0",
      totalPayable,
      // ====================== ADDED ONLY (nothing removed) ======================
      designation,
      address,
      bankAccount,
      ifsc,
    } = req.body;

    // Proper validation
    if (!employeeId || !employeeName || !email || !phone || 
        !dateOfJoining || !lastWorkingDay || !pendingSalary || 
        totalPayable === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: employeeId, employeeName, email, phone, dateOfJoining, lastWorkingDay, pendingSalary, totalPayable'
      });
    }

    const fnfRecord = await FNF.create({
      employeeId: employeeId.trim().toUpperCase(),
      employeeName: employeeName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      dateOfJoining,
      lastWorkingDay,
      pendingSalary: String(pendingSalary),
      leaveEncashment: String(leaveEncashment),
      incentive: String(incentive),
      deductions: String(deductions),
      totalPayable: Number(totalPayable),
      // ====================== ADDED ONLY (nothing removed) ======================
      designation: designation || 'N/A',
      address: address || 'N/A',
      bankAccount: bankAccount || 'N/A',
      ifsc: ifsc || 'N/A',
    });

    return res.status(201).json({
      success: true,
      message: 'FNF record created successfully',
      data: fnfRecord,
    });
  } catch (err) {
    console.error('Create FNF error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create FNF record',
      error: err.message,
    });
  }
};

/**
 * Send FNF Statement email
 */
const sendEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email: emailFromBody } = req.body;

    const fnfRecord = await FNF.findById(id);
    if (!fnfRecord) return res.status(404).json({ success: false, message: 'FNF record not found' });

    const recipientEmail = emailFromBody?.trim() || fnfRecord.email;
    if (!recipientEmail) return res.status(400).json({ success: false, message: 'No recipient email provided' });

    // ====================== UPDATED ONLY (nothing removed) ======================
    const emailData = {
      employeeName: fnfRecord.employeeName,
      dateOfJoining: fnfRecord.dateOfJoining,
      lastWorkingDay: fnfRecord.lastWorkingDay,
      pendingSalary: fnfRecord.pendingSalary,
      leaveEncashment: fnfRecord.leaveEncashment,
      incentive: fnfRecord.incentive,
      deductions: fnfRecord.deductions,
      totalPayable: fnfRecord.totalPayable,
      email: fnfRecord.email,

      // These fields were missing earlier → now correctly passed to PDF
      employeeId: fnfRecord.employeeId,
      designation: fnfRecord.designation || 'N/A',
      address: fnfRecord.address || 'N/A',
      bankAccount: fnfRecord.bankAccount || 'N/A',
      ifsc: fnfRecord.ifsc || 'N/A',
      phone: fnfRecord.phone   // ← for Contact field
    };
    // ==============================================================================

    await sendFNFEmailService(recipientEmail, emailData);

    return res.json({ success: true, message: 'FNF Statement sent successfully', sentTo: recipientEmail });
  } catch (err) {
    console.error('Send FNF email error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send FNF email', error: err.message });
  }
};

module.exports = { createFNFRecord, sendEmail };