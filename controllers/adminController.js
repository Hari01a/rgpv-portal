const Admin = require("../models/Admin");
const Payment = require("../models/Payment");
const jwt = require("jsonwebtoken");
const { auditLog } = require("../middleware/auditLog");

// Admin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await Admin.findOne({
      username: username.toLowerCase(),
    }).select("+password");

    if (!admin || !admin.isActive) {
      await auditLog(
        "admin_login",
        null,
        "Admin",
        { username },
        "failure",
        "Admin not found"
      );

      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(423).json({
        success: false,
        message: "Account locked due to multiple failed attempts",
      });
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      admin.loginAttempts = (admin.loginAttempts || 0) + 1;

      if (admin.loginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await admin.save();

      await auditLog(
        "admin_login",
        admin._id,
        "Admin",
        { username },
        "failure",
        "Invalid password"
      );

      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Reset login attempts
    if (admin.loginAttempts > 0) {
      admin.loginAttempts = 0;
      admin.lockUntil = undefined;
    }

    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    await auditLog("admin_login", admin._id, "Admin", { username });

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Get All Payments
exports.getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate("student", "fullName email mobile")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve Payment
exports.approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        status: "approved",
        adminRemarks: remarks,
        approvedBy: req.admin._id,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    await auditLog("payment_approve", req.admin._id, "Admin", {
      paymentId: id,
      enrollment: payment.enrollment,
    });

    res.json({
      success: true,
      message: "Payment approved",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject Payment
exports.rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        rejectionReason: reason,
        rejectedAt: new Date(),
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    await auditLog("payment_reject", req.admin._id, "Admin", {
      paymentId: id,
      enrollment: payment.enrollment,
      reason,
    });

    res.json({
      success: true,
      message: "Payment rejected",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin Logout
exports.logoutAdmin = async (req, res) => {
  try {
    await auditLog("admin_logout", req.admin._id, "Admin", {
      username: req.admin.username,
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
