const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const studentAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token, access denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.id);

    if (!student || !student.isActive) {
      return res.status(401).json({
        success: false,
        message: "Student not found or inactive",
      });
    }

    if (student.isLocked()) {
      return res.status(423).json({
        success: false,
        message: "Account is locked due to too many failed login attempts",
      });
    }

    req.student = student;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

module.exports = { studentAuth };
