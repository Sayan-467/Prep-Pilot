const AppError = require("../utils/AppError");

module.exports = (err, req, res, next) => {
  console.error("❌ ERROR:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      errorCode: err.errorCode,
      message: err.message
    });
  }

  // mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION_ERROR",
      message: err.message
    });
  }

  return res.status(500).json({
    success: false,
    errorCode: "SERVER_ERROR",
    message: "Something went wrong"
  });
};
