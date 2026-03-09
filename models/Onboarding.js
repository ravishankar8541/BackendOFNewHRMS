const mongoose = require("mongoose");

const OnboardingSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  idProof: String,
  addressProof: String,
  educationProof: String,
  experienceLetter: String,
  bgVerification: Boolean,
});

module.exports = mongoose.model("Onboarding", OnboardingSchema);