const express = require("express");
const { createAccount, login, getUser } = require("../controllers/user.controller");
const { authenticationToken } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validation");
const { authLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/create-user", authLimiter, validate(schemas.register), createAccount);
router.post("/login", authLimiter, validate(schemas.login), login);
router.get("/get-user", authenticationToken, getUser);

module.exports = router;
