const mongoose = require("mongoose");

const OffboardingSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  lastWorkingDay: Date,
  laptopReturned: Boolean,
  idCardReturned: Boolean,
  clearanceApproved: Boolean,
  exitInterview: String,
});

module.exports = mongoose.model("Offboarding", OffboardingSchema);