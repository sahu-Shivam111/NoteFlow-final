const express = require("express");
const aiController = require("../controllers/ai.controller");
const { authenticationToken } = require("../middleware/auth");
const { validateObjectId } = require("../middleware/validation");

const router = express.Router();

router.post(
  "/summarize/:noteId",
  authenticationToken,
  validateObjectId("noteId"),
  aiController.summarizeNote
);

module.exports = router;
