const express = require('express');
const router = express.Router();
const { createAppointment, sendEmail } = require('../controllers/appointmentLetterController');

// Route to save data
router.post('/appointment/create', createAppointment);

// Route to send email by record ID
router.post('/appointment/send/:id', sendEmail);

module.exports = router;