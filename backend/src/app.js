const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { getAllowedOrigins } = require("./config/env");
const { globalLimiter } = require("./middleware/rateLimit");
const { errorHandler } = require("./middleware/errorHandler");
const routes = require("./routes");

const allowedOrigins = getAllowedOrigins();

const app = express();

app.use(globalLimiter);

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

app.use(express.json({ limit: "1mb" }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/", routes);
app.use(errorHandler);

module.exports = app;
