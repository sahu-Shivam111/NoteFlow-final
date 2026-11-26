const rateLimit = require("express-rate-limit");
const { isTestEnv } = require("../config/env");

function createLimiter(options) {
  const limiter = rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });

  return (req, res, next) => {
    if (isTestEnv()) return next();
    return limiter(req, res, next);
  };
}

const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    error: true,
    message: "Too many requests. Please wait 15 minutes and try again.",
  },
});

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: true,
    message: "Too many sign-in attempts. Please wait 15 minutes and try again.",
  },
});

module.exports = { globalLimiter, authLimiter };
