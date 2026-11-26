const express = require("express");
const {
  addNote,
  editNote,
  getAllNotes,
  deleteNote,
  updateNotePinned,
  searchNotes,
  getAttachment,
} = require("../controllers/note.controller");
const { authenticationToken } = require("../middleware/auth");
const { validate, validateObjectId, schemas } = require("../middleware/validation");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/add-note", authenticationToken, upload.any(), validate(schemas.createNote), addNote);
router.put(
  "/edit-note/:noteId",
  authenticationToken,
  validateObjectId("noteId"),
  upload.any(),
  validate(schemas.editNote),
  editNote
);
router.get("/get-all-notes", authenticationToken, getAllNotes);
router.delete("/delete-note/:noteId", authenticationToken, validateObjectId("noteId"), deleteNote);
router.put(
  "/update-note-pinned/:noteId",
  authenticationToken,
  validateObjectId("noteId"),
  validate(schemas.updatePinned),
  updateNotePinned
);
router.get("/search-notes", authenticationToken, searchNotes);
router.get(
  "/get-attachment/:noteId/:attachmentId",
  authenticationToken,
  validateObjectId("noteId", "attachmentId"),
  getAttachment
);

module.exports = router;
