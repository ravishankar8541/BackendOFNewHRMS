const Salary = require('../models/SalarySlip');
const sendSalarySlipEmail = require('../utils/sendSalarySlip');
const { toWords } = require("number-to-words");
/**
 * Create a new Salary Slip record
 * @route   POST /api/salary-slips
 * @access  Private (admin/HR)
 */
const createSalarySlip = async (req, res) => {
  try {
    const {
      employeeName,
      email,
      empId,
      designation,
      month,
      doj,
      pan,
      aadhar,
      accNo,
      ifsc,
      phone,
      nod,
      basic,
      allowance = 0,
      bonus = 0,
      pf = 0,               // frontend sends "pf"
      totalLeaveDays = 0,
      otherDeduction = 0,
    } = req.body;

    // 1. Basic validation (same as before)
    if (!employeeName || !email || !month || !basic) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: employeeName, email, month, basic',
      });
    }

    // 2. Financial Calculations — exactly same as frontend
    const basicAmount = Number(basic || 0);
    const allowanceAmount = Number(allowance || 0);
    const bonusAmount = Number(bonus || 0);

    const grossEarnings = basicAmount + allowanceAmount + bonusAmount;

    const workingDays = Number(nod) > 0 ? Number(nod) : 30;
    const lopDays = Number(totalLeaveDays || 0);
    const lopDeduction = (grossEarnings / workingDays) * lopDays;

    const pfDeduction = Number(pf || 0);
    const otherDeductionAmount = Number(otherDeduction || 0);

    const totalDeductions = lopDeduction + pfDeduction + otherDeductionAmount;
    const netPayable = grossEarnings - totalDeductions;

    // 3. Save to database — now matches frontend completely
    const salaryRecord = await Salary.create({
      employeeName: employeeName.trim(),
      employeeEmail: email.trim().toLowerCase(),
      employeeId: empId || "N/A",
      designation: designation || "Staff",
      monthYear: month,
      joiningDate: doj,
      panNumber: pan,
      aadharNumber: aadhar,
      bankAccount: accNo,
      ifsc: ifsc,
      phone: phone,
      workingDays,
      lopDays,
      basicSalary: basicAmount,
      allowance: allowanceAmount,
      bonus: bonusAmount,
      pfDeduction: pfDeduction,
      otherDeduction: otherDeductionAmount,
      lopAmount: lopDeduction,
      grossEarnings,
      totalDeductions,
      netPayable,
      emailStatus: 'Pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Salary slip generated and saved successfully',
      data: salaryRecord
    });
  } catch (err) {
    console.error('DATABASE SAVE ERROR:', err.errors || err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate salary slip record',
      error: err.message
    });
  }
};

/**
 * Send Salary Slip email with PDF
 * @route   POST /api/salary-slips/:id/send
 */
const sendSalaryEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const salaryRecord = await Salary.findById(id);

    if (!salaryRecord) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

        const netPayWords = toWords(salaryRecord.netPayable);

    // Data passed to email/PDF utility — now includes all fields frontend uses
    const emailData = {
      employeeName: salaryRecord.employeeName,
      employeeId: salaryRecord.employeeId,
      designation: salaryRecord.designation,
      monthYear: salaryRecord.monthYear,
      joiningDate: salaryRecord.joiningDate,
      panNumber: salaryRecord.panNumber,
      aadharNumber: salaryRecord.aadharNumber,
      bankAccount: salaryRecord.bankAccount,
      ifsc: salaryRecord.ifsc || "",  // ADD THIS
      phone: salaryRecord.phone || "",
      workingDays: salaryRecord.workingDays,
      lopDays: salaryRecord.lopDays,
      basicSalary: salaryRecord.basicSalary,
      allowance: salaryRecord.allowance,
      bonus: salaryRecord.bonus,
      lopAmount: salaryRecord.lopAmount,
      pfDeduction: salaryRecord.pfDeduction,
      otherDeduction: salaryRecord.otherDeduction,
      grossEarnings: salaryRecord.grossEarnings,
      totalDeductions: salaryRecord.totalDeductions,
      netPayable: salaryRecord.netPayable,
      netPayWords: netPayWords

    };

    await sendSalarySlipEmail(salaryRecord.employeeEmail, emailData);

    salaryRecord.emailStatus = 'Sent';
    await salaryRecord.save();

    return res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error('Send email error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  createSalarySlip,
  sendSalaryEmail,
};