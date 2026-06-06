const express = require("express");
const router = express.Router();

const Payment = require("./payment");

const {
  submitPayment,
  approvePayment,
  rejectPayment
} = require("./paymentController");

router.post("/payment", submitPayment);

router.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

router.get("/payment/:enrollment", async (req, res) => {
  try {

    const student = await Payment.findOne({
      enrollment: req.params.enrollment
    });

    if (!student) {
      return res.status(404).json({
        message: "Student Not Found"
      });
    }

    res.json(student);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});

router.put(
  "/payment/approve/:id",
  approvePayment
);

router.put(
  "/payment/reject/:id",
  rejectPayment
);

module.exports = router;