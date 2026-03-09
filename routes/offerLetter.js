const express = require('express');
const router = express.Router();
const { createOffer, sendEmail } = require('../controllers/offerLetterController');

router.post('/', createOffer);
router.post('/:id/send', sendEmail);

module.exports = router;