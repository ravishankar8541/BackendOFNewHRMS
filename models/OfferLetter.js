const mongoose = require('mongoose');

const OfferLetterSchema = new mongoose.Schema({
  offerId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  employeeName: { 
    type: String, 
    required: true,
    trim: true 
  },
  fathersName: { 
    type: String, 
    required: true,
    trim: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  emailId: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  position: { 
    type: String, 
    required: true 
  },
  salary: { 
    type: Number, 
    required: true 
  },
  joiningDate: { 
    type: Date, 
    required: true 
  },
  hrName: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('OfferLetter', OfferLetterSchema);