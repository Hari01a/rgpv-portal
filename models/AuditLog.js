const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "student_login",
        "student_register",
        "student_logout",
        "payment_submit",
        "payment_approve",
        "payment_reject",
        "admin_login",
        "admin_logout",
        "profile_update",
        "password_change",
      ],
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "actorModel",
    },

    actorModel: {
      type: String,
      enum: ["Student", "Admin"],
    },

    details: {
      type: Object,
      default: {},
    },

    ipAddress: String,
    userAgent: String,

    status: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
    },

    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
