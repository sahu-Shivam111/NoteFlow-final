const multer = require("multer");

/**
 * Centralized Express error handler returning structured JSON responses.
 */
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File size exceeds the 5MB limit."
        : err.code === "LIMIT_FILE_COUNT"
          ? "Maximum 5 files allowed per upload."
          : err.message;
    return res.status(400).json({ error: true, message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ error: true, message: "Invalid identifier." });
  }

  if (err.statusCode) {
    const payload = { error: true, message: err.message };
    if (err.retryAfter) payload.retryAfter = err.retryAfter;
    return res.status(err.statusCode).json(payload);
  }

  console.error("Unhandled Error:", err);
  return res.status(500).json({
    error: true,
    message: "Internal Server Error.",
  });
}

module.exports = { errorHandler };
