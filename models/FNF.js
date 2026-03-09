const mongoose = require('mongoose');

const fnfSchema = new mongoose.Schema(
  {
    employeeId: { 
      type: String, 
      required: true, 
      trim: true 
    },
    employeeName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    dateOfJoining: {
      type: String, 
      required: true
    },
    lastWorkingDay: {
      type: String,
      required: true
    },
    pendingSalary: {
      type: String,
      required: true
    },
    leaveEncashment: {
      type: String,
      default: "0"
    },
    incentive: {
      type: String,
      default: "0"
    },
    deductions: {
      type: String,
      default: "0"
    },
    totalPayable: {
      type: Number,
      required: true
    },

    // ====================== FIXED - THESE WERE MISSING ======================
    designation: {
      type: String,
      trim: true,
      default: 'N/A'
    },
    address: {
      type: String,
      trim: true,
      default: 'N/A'
    },
    bankAccount: {
      type: String,
      trim: true,
      default: 'N/A'
    },
    ifsc: {
      type: String,
      uppercase: true,
      trim: true,
      default: 'N/A'
    }
    // =======================================================================
  },
  { timestamps: true }
);

module.exports = mongoose.model('FNF', fnfSchema);