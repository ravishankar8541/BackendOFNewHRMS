const OfferLetter = require('../models/OfferLetter');
const sendOfferLetter = require('../utils/emailService');

const createOffer = async (req, res) => {
  try {
    // 1. Destructure the NEW fields from the request body
    const { 
      employeeName, 
      fathersName,   
      address, 
      phoneNumber,   
      emailId,       
      position, 
      salary, 
      joiningDate, 
      hrName 
    } = req.body;

    const offerId = `HRMS/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Pass the NEW fields into the .create() method
    const offer = await OfferLetter.create({
      offerId,
      employeeName,
      fathersName,   
      address,
      phoneNumber,   
      emailId,       
      position,
      salary: Number(salary),
      joiningDate: new Date(joiningDate),
      hrName,
    });

    res.status(201).json({ success: true, offerId, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const sendEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const offer = await OfferLetter.findById(id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

    // This will now pass the 'offer' object containing all the new fields to your email service
    await sendOfferLetter(email, offer);

    res.json({ success: true, message: 'Offer letter sent successfully with PDF attachment' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOffer, sendEmail };