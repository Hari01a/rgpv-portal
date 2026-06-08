const AuditLog = require("../models/AuditLog");

const auditLog = async (action, actor, actorModel, details = {}, status = "success", errorMessage = null) => {
  try {
    const log = new AuditLog({
      action,
      actor,
      actorModel,
      details,
      status,
      errorMessage,
    });

    await log.save();
  } catch (error) {
    console.error("Error saving audit log:", error);
  }
};

const auditMiddleware = (action, actorModel) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = async function (data) {
      const actor = req.student?._id || req.admin?._id;

      if (actor) {
        const statusCode = res.statusCode;
        const isSuccess = statusCode >= 200 && statusCode < 300;

        await auditLog(
          action,
          actor,
          actorModel,
          {
            ip: req.ip,
            userAgent: req.get("user-agent"),
            body: req.body,
            response: typeof data === "string" ? data : JSON.stringify(data),
          },
          isSuccess ? "success" : "failure",
          isSuccess ? null : "Request failed"
        );
      }

      res.send = originalSend;
      return res.send(data);
    };

    next();
  };
};

module.exports = { auditLog, auditMiddleware };
