const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { getAllowedOrigins } = require("./config/env");
const { globalLimiter } = require("./middleware/rateLimit");
const { errorHandler } = require("./middleware/errorHandler");
const routes = require("./routes");

const allowedOrigins = getAllowedOrigins();

const app = express();

// 1. CORS should come first
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 2. Rate limiter — apply only once
app.use(globalLimiter);

// 3. Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "*"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "frame-ancestors": ["'self'", ...allowedOrigins],
      },
    },
    frameguard: false,
  })
);

// 4. Parse JSON
app.use(express.json({ limit: "1mb" }));

// 5. Routes
app.use("/", routes);

// 6. Error handler
app.use(errorHandler);

module.exports = app;