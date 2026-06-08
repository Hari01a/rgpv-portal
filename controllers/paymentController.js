const Payment = require("../models/Payment");
const Student = require("../models/Student");
const fs = require("fs");
const path = require("path");
const { auditLog } = require("../middleware/auditLog");

// Submit Payment
exports.submitPayment = async (req, res) => {
  try {
    const { course, branch, semester, amount, transactionId, remarks } = req.body;
    const enrollment = req.student.enrollment;

    // Check if student already has a pending payment
    const existingPayment = await Payment.findOne({
      enrollment,
      status: "pending",
    });

    if (existingPayment) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }

      return res.status(400).json({
        success: false,
        message: "You already have a pending payment request",
      });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Transaction slip is required",
      });
    }

    // Create payment record
    const payment = new Payment({
      student: req.student._id,
      enrollment,
      course,
      branch,
      semester,
      amount,
      transactionId,
      remarks,
      transactionSlip: {
        filename: req.file.filename,
        path: req.file.path,
        uploadedAt: new Date(),
        mimeType: req.file.mimetype,
      },
    });

    await payment.save();

    await auditLog("payment_submit", req.student._id, "Student", {
      paymentId: payment._id,
      enrollment,
      amount,
      transactionId,
    });

    res.status(201).json({
      success: true,
      message: "Payment submitted successfully. You will be notified of the status soon.",
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    console.error("Payment Submission Error:", error);

    await auditLog(
      "payment_submit",
      req.student?._id,
      "Student",
      { enrollment: req.student?.enrollment },
      "failure",
      error.message
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Payment Status
exports.getPaymentStatus = async (req, res) => {
  try {
    const enrollment = req.student.enrollment;

    const payment = await Payment.findOne({ enrollment }).populate(
      "student",
      "fullName email mobile"
    );

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

// Download Receipt (Admin only)
exports.downloadReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).populate(
      "student",
      "fullName enrollment email"
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    if (payment.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Receipt available only for approved payments",
      });
    }

    // Generate receipt (simplified - in production use PDF library)
    const receipt = `
    RGPV EXAMINATION PORTAL - PAYMENT RECEIPT
    ==========================================
    Receipt ID: ${payment._id}
    Date: ${new Date().toLocaleDateString()}
    
    Student Details:
    Name: ${payment.student.fullName}
    Enrollment: ${payment.enrollment}
    Email: ${payment.student.email}
    
    Payment Details:
    Course: ${payment.course}
    Branch: ${payment.branch}
    Semester: ${payment.semester}
    Amount: ₹${payment.amount}
    Transaction ID: ${payment.transactionId}
    Status: ${payment.status.toUpperCase()}
    Approved On: ${payment.approvedAt ? new Date(payment.approvedAt).toLocaleDateString() : "N/A"}
    ==========================================
    `;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="receipt_${payment._id}.txt"`
    );
    res.send(receipt);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
