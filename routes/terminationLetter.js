const express = require('express');
const router = express.Router();

const { createTermination, sendEmail } = require('../controllers/terminationLetterController');

router.post('/', createTermination);
router.post('/:id/send', sendEmail);

module.exports = router;