const express = require('express');
const router = express.Router();

// Import the FNF controller functions
const { createFNFRecord, sendEmail } = require('../controllers/fnfController');

/**
 * @route   POST /api/fnf
 * @desc    Create a new FNF settlement record in the database
 * @access  Private (Admin/HR)
 */
router.post('/', createFNFRecord);

/**
 * @route   POST /api/fnf/:id/send
 * @desc    Generate FNF PDF and send it via email to the employee
 * @access  Private (Admin/HR)
 */
router.post('/:id/send', sendEmail);

module.exports = router;