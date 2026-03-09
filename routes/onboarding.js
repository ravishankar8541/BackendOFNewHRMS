const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Employee = require('../models/Employee');

// ────────────────────────────────────────────────
// 1. Ensure 'uploads' folder exists (with recursive creation)
const uploadDir = path.join(__dirname, '..', 'uploads'); // better: relative to project root
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("✅ Created 'uploads' directory");
}

// ────────────────────────────────────────────────
// 2. Multer configuration – improved security & organization
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png',          // for photo
        'application/pdf'                                // for documents
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG & PDF allowed.'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter
});

// ────────────────────────────────────────────────
// 3. Onboarding submission route
router.post('/submit/:id', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'idProof', maxCount: 1 },         // Aadhaar
    { name: 'addressProof', maxCount: 1 },    // PAN
    { name: 'educationProof', maxCount: 1 },
    { name: 'experienceLetter', maxCount: 1 }
]), async (req, res) => {
    try {
        const employeeId = req.params.id;
        if (!employeeId) {
            return res.status(400).json({ error: "Employee ID is required" });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Prepare update object
        const updateData = { ...req.body };

        // Save file paths (relative path – good for serving via /uploads)
        if (req.files) {
            if (req.files.photo) updateData.photo = `uploads/${req.files.photo[0].filename}`;
            if (req.files.idProof) updateData.adharCardDoc = `uploads/${req.files.idProof[0].filename}`;
            if (req.files.addressProof) updateData.panCardDoc = `uploads/${req.files.addressProof[0].filename}`;
            if (req.files.educationProof) updateData.educationProof = `uploads/${req.files.educationProof[0].filename}`;
            if (req.files.experienceLetter) updateData.experienceLetter = `uploads/${req.files.experienceLetter[0].filename}`;
        }

        // Mark onboarding as done
        updateData.onboardingStatus = 'Completed';
        updateData.onboardingCompletedAt = new Date();

        // Update employee
        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Onboarding completed successfully",
            employee: updatedEmployee
        });
    } catch (error) {
        console.error("Onboarding submission error:", error);
        res.status(500).json({
            error: "Failed to complete onboarding",
            details: error.message
        });
    }
});

// Optional: GET all employees (already good, but can be improved)
router.get('/employees', async (req, res) => {
    try {
        const employees = await Employee.find()
            .select('-__v') // exclude version key if not needed
            .sort({ createdAt: -1 });
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;