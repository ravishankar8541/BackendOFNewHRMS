const mongoose = require('mongoose');

const terminationSchema = new mongoose.Schema({
  // Link to the Employee document
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  // We store snapshots in case the employee record is deleted later
  employeeName: { 
    type: String, 
    required: true,
    trim: true 
  },
  employeeEmail: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  employeePhone: { 
    type: String 
  },
  // Added designation to match your DESIGNATION_OPTIONS and CustomDropdown
  designation: {
    type: String,
    required: true
  },
  lastWorkingDate: { 
    type: Date, 
    required: true 
  },
  reason: { 
    type: String, 
    required: [true, "Reason for termination must be documented"] 
  },
  hrName: { 
    type: String, 
    required: true,
    default: "HR Manager"
  },
  // Track if the email was successfully sent
  emailStatus: { 
    type: String, 
    enum: ['Sent', 'Pending', 'Failed'], 
    default: 'Pending' 
  },
  noticeDate: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexing for faster history lookups
terminationSchema.index({ employeeEmail: 1, noticeDate: -1 });

module.exports = mongoose.model('Termination', terminationSchema);