const mongoose = require('mongoose');

const AppointmentLetterSchema = new mongoose.Schema({
    // Unique identifier for the letter
    offerId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    // Matches 'employeeName' in getPayload
    employeeName: { 
        type: String, 
        required: true 
    },
    // New field to match frontend
    fathersName: { 
        type: String, 
        required: true 
    },
    address: { 
        type: String, 
        required: true 
    },
    // Matches 'position' in getPayload
    position: { 
        type: String, 
        required: true 
    },
    salary: { 
        type: Number, 
        required: true 
    },
    // Matches 'joiningDate' in getPayload
    joiningDate: { 
        type: Date, 
        required: true 
    },
    // Matches 'hrName' (which is formData.manager)
    hrName: { 
        type: String, 
        required: true 
    },
    // New field for phone
    phone: { 
        type: String, 
        required: true 
    },
    // New field for personal email
    email: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

module.exports = mongoose.model('AppointmentLetter', AppointmentLetterSchema);