const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure Multer (temporary disk storage - you can change to cloud/S3 later)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // make sure 'uploads/' folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Import controllers
const {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee
} = require('../controllers/employeeController');

// Routes
router.post("/", createEmployee); // ← If this route also has files, add upload here too

router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);

// IMPORTANT FIX: Add Multer to PUT route
router.put('/:id', 
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'adharCardDoc', maxCount: 1 },
    { name: 'panCardDoc', maxCount: 1 },
    { name: 'educationProof', maxCount: 1 },
    { name: 'experienceLetter', maxCount: 1 },
  ]), 
  updateEmployee
);

router.delete('/:id', deleteEmployee);

module.exports = router;