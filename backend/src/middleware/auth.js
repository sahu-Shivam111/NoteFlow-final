const jwt = require("jsonwebtoken");
const { getAccessTokenSecret } = require("../config/env");

/**
 * Verify Bearer JWT from the Authorization header and attach user payload to req.user.
 */
function authenticationToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";

  if (!token) return res.sendStatus(401);

  jwt.verify(token, getAccessTokenSecret(), (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = { authenticationToken };
