const express = require('express');
const { createSalarySlip, sendSalaryEmail } = require('../controllers/salaryController');

const router = express.Router();
// Import the salary slip controller functions


/**
 * @route   POST /api/salary-slips
 * @desc    Generate and save a new salary slip record
 * @access  Private (HR/Admin)
 */
router.post('/', createSalarySlip);

/**
 * @route   POST /api/salary-slips/:id/send
 * @desc    Generate PDF and email the salary slip to the employee
 * @access  Private (HR/Admin)
 */
router.post('/:id/send', sendSalaryEmail);

module.exports = router;