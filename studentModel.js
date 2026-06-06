const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

  fullName: {
    type: String,
    required: true
  },

  enrollment: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true
  },

  mobile: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  }

});

module.exports =
mongoose.model(
  "Student",
  studentSchema
);