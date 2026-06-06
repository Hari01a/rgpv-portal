const Payment = require("./payment");

// SUBMIT PAYMENT
const submitPayment = async (req, res) => {

  try {

    const existingStudent = await Payment.findOne({
      enrollment: req.body.enrollment
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "You have already submitted your request!"
      });
    }

    await Payment.create(req.body);

    return res.status(201).json({
      message: "Payment Submitted Successfully"
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });

  }
};


// APPROVE PAYMENT
const approvePayment = async (req, res) => {

  try {

    await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved"
      }
    );

    res.json({
      message: "Payment Approved"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// REJECT PAYMENT
const rejectPayment = async (req, res) => {

  try {

    await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected"
      }
    );

    res.json({
      message: "Payment Rejected"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

module.exports = {
  submitPayment,
  approvePayment,
  rejectPayment
};