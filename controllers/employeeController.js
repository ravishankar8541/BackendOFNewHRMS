const mongoose = require("mongoose");
const Employee = require("../models/Employee");

/**
 * @desc    Get all employees
 * @route   GET /api/employees
 * @access  Public
 */
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single employee
 * @route   GET /api/employees/:id
 * @access  Public
 */
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const employee = await Employee.findById(id).lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
};

/**
 * @desc    Create employee
 * @route   POST /api/employees
 * @access  Public
 */
exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    // Duplicate email handling
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val) => val.message
      );

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create employee",
      error: error.message,
    });
  }
};

/**
 * @desc    Update employee
 * @route   PUT /api/employees/:id
 * @access  Public
 */
/**
 * @desc    Update employee
 * @route   PUT /api/employees/:id
 * @access  Public
 */
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid employee ID" });
    }

    // Step 1: Collect ALL text fields from req.body (Multer puts them here)
    const updates = { ...req.body };

    // Step 2: Convert salary to number if present
    if (updates.salary && updates.salary !== '') {
      updates.salary = Number(updates.salary);
    }

    // Step 3: Handle uploaded files (Multer puts them in req.files)
    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        updates.photo = req.files.photo[0].filename; // or .path depending on your multer config
      }
      if (req.files.adharCardDoc && req.files.adharCardDoc[0]) {
        updates.adharCardDoc = req.files.adharCardDoc[0].filename;
      }
      if (req.files.panCardDoc && req.files.panCardDoc[0]) {
        updates.panCardDoc = req.files.panCardDoc[0].filename;
      }
      if (req.files.educationProof && req.files.educationProof[0]) {
        updates.educationProof = req.files.educationProof[0].filename;
      }
      if (req.files.experienceLetter && req.files.experienceLetter[0]) {
        updates.experienceLetter = req.files.experienceLetter[0].filename;
      }
    }

    // Step 4: Perform the update
    const employee = await Employee.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    console.error("Update error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update employee",
      error: error.message,
    });
  }
};
/**
 * @desc    Delete employee
 * @route   DELETE /api/employees/:id
 * @access  Public
 */
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete employee",
      error: error.message,
    });
  }
};