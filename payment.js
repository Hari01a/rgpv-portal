const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

  course: String,
  name: String,
  enrollment: String,
  branch: String,
  semester: String,

  email: String,
  mobile: String,

  transactionId: String,
  amount: Number,

  remarks: String,

  transactionSlip: String,

  status: {
    type: String,
    default: "pending"
  },

  adminResponse: {
    type: String,
    default: ""
  }

});

module.exports =
mongoose.model(
  "Payment",
  paymentSchema
);