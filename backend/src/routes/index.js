const express = require("express");
const userRoutes = require("./user.routes");
const noteRoutes = require("./note.routes");
const aiRoutes = require("./ai.routes");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "NoteFlow Backend is running!" });
});

router.use("/", userRoutes);
router.use("/", noteRoutes);
router.use("/api/ai", aiRoutes);

module.exports = router;
