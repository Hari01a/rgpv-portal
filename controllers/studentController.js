const Student = require("../models/Student");
const Payment = require("../models/Payment");
const jwt = require("jsonwebtoken");
const { auditLog } = require("../middleware/auditLog");

// Student Registration
exports.registerStudent = async (req, res) => {
  try {
    const { fullName, enrollment, email, mobile, password } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ enrollment }, { email }],
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: existingStudent.enrollment === enrollment.toUpperCase()
          ? "Enrollment number already registered"
          : "Email already registered",
      });
    }

    // Create new student
    const student = new Student({
      fullName,
      enrollment: enrollment.toUpperCase(),
      email: email.toLowerCase(),
      mobile,
      password,
    });

    await student.save();

    await auditLog("student_register", student._id, "Student", {
      enrollment: student.enrollment,
      email: student.email,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please login.",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    
    await auditLog(
      "student_register",
      null,
      "Student",
      { email: req.body.email },
      "failure",
      error.message
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Student Login
exports.loginStudent = async (req, res) => {
  try {
    const { enrollment, password } = req.body;

    // Find student by enrollment
    const student = await Student.findOne({
      enrollment: enrollment.toUpperCase(),
    }).select("+password");

    if (!student) {
      await auditLog(
        "student_login",
        null,
        "Student",
        { enrollment },
        "failure",
        "Student not found"
      );

      return res.status(401).json({
        success: false,
        message: "Invalid enrollment or password",
      });
    }

    // Check if account is locked
    if (student.isLocked()) {
      return res.status(423).json({
        success: false,
        message: "Account is locked due to multiple failed attempts. Try again after 30 minutes.",
      });
    }

    // Compare password
    const isPasswordValid = await student.comparePassword(password);

    if (!isPasswordValid) {
      await student.incLoginAttempts();

      await auditLog(
        "student_login",
        student._id,
        "Student",
        { enrollment: student.enrollment },
        "failure",
        "Invalid password"
      );

      return res.status(401).json({
        success: false,
        message: "Invalid enrollment or password",
      });
    }

    // Reset login attempts on successful login
    if (student.loginAttempts > 0) {
      await student.resetLoginAttempts();
    }

    // Update last login
    student.lastLogin = new Date();
    await student.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, enrollment: student.enrollment },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    await auditLog("student_login", student._id, "Student", {
      enrollment: student.enrollment,
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      student: {
        id: student._id,
        fullName: student.fullName,
        enrollment: student.enrollment,
        email: student.email,
        mobile: student.mobile,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Get Student Profile
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id).select(
      "-password -emailVerificationToken -passwordResetToken"
    );

    res.json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Student Payment Status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { enrollment } = req.params;

    const payment = await Payment.findOne({
      enrollment: enrollment.toUpperCase(),
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "No payment record found",
      });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout
exports.logoutStudent = async (req, res) => {
  try {
    await auditLog("student_logout", req.student._id, "Student", {
      enrollment: req.student.enrollment,
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
