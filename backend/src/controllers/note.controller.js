const Note = require("../models/note.model");
const { MAX_SEARCH_LENGTH } = require("../config/env");
const { asyncHandler } = require("../utils/asyncHandler");
const { parsePagination } = require("../utils/pagination");
const { attachmentContentDisposition } = require("../utils/headers");
const {
  createAttachmentsForNote,
  deleteAttachmentsByIds,
  deleteAllNoteAttachments,
  findNoteAttachment,
} = require("../services/attachment.service");
const {
  parseTags,
  parseDeleteAttachmentIds,
  listUserNotes,
  searchUserNotes,
} = require("../services/note.service");

exports.addNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const { user } = req.user;
  const tags = parseTags(req.body);
  const filesToUpload = req.files || [];

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required." });
  }

  if (!content) {
    return res.status(400).json({ error: true, message: "Content is required." });
  }

  const note = new Note({
    title,
    content,
    tags: tags || [],
    userId: user._id,
  });

  await note.save();

  if (filesToUpload.length > 0) {
    note.attachments = await createAttachmentsForNote(note._id, filesToUpload);
    await note.save();
  }

  return res.json({
    error: false,
    note,
    message: "Note added successfully.",
  });
});

exports.editNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { title, content, isPinned } = req.body;
  const { user } = req.user;
  const tags = parseTags(req.body);
  const deleteAttachmentIds = parseDeleteAttachmentIds(req.body.deleteAttachmentId);
  const filesToUpload = req.files || [];

  if (
    !title &&
    !content &&
    tags === undefined &&
    isPinned === undefined &&
    filesToUpload.length === 0 &&
    deleteAttachmentIds.length === 0
  ) {
    return res.status(400).json({ error: true, message: "No changes provided." });
  }

  const note = await Note.findOne({ _id: noteId, userId: user._id });
  if (!note) {
    return res.status(404).json({ error: true, message: "Note not found." });
  }

  if (title) note.title = title;
  if (content) note.content = content;
  if (tags !== undefined) note.tags = tags;
  if (isPinned !== undefined) note.isPinned = isPinned;

  if (deleteAttachmentIds.length > 0) {
    await deleteAttachmentsByIds(note._id, deleteAttachmentIds);
    note.attachments = note.attachments.filter(
      (att) => !deleteAttachmentIds.includes(att.attachmentId.toString())
    );
  }

  if (filesToUpload.length > 0) {
    const newMetadata = await createAttachmentsForNote(note._id, filesToUpload);
    note.attachments.push(...newMetadata);
  }

  await note.save();

  return res.json({
    error: false,
    note,
    message: "Note updated successfully.",
  });
});

exports.getAllNotes = asyncHandler(async (req, res) => {
  const { user } = req.user;
  const pagination = parsePagination(req.query);
  const result = await listUserNotes({ userId: user._id, ...pagination });

  return res.json({
    error: false,
    ...result,
    message: "All notes retrieved successfully.",
  });
});

exports.deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { user } = req.user;

  const note = await Note.findOne({ _id: noteId, userId: user._id });
  if (!note) {
    return res.status(404).json({ error: true, message: "Note not found." });
  }

  await deleteAllNoteAttachments(noteId);
  await Note.deleteOne({ _id: noteId, userId: user._id });

  return res.json({
    error: false,
    message: "Note deleted successfully.",
  });
});

exports.updateNotePinned = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { isPinned } = req.body;
  const { user } = req.user;

  const note = await Note.findOne({ _id: noteId, userId: user._id });
  if (!note) {
    return res.status(404).json({ error: true, message: "Note not found." });
  }

  note.isPinned = isPinned;
  await note.save();

  return res.json({
    error: false,
    note,
    message: "Note updated successfully.",
  });
});

exports.searchNotes = asyncHandler(async (req, res) => {
  const { user } = req.user;
  const trimmed = String(req.query.query || "").trim();

  if (!trimmed) {
    return res.status(400).json({ error: true, message: "Search query is required." });
  }

  if (trimmed.length > MAX_SEARCH_LENGTH) {
    return res.status(400).json({
      error: true,
      message: `Search query must be ${MAX_SEARCH_LENGTH} characters or fewer.`,
    });
  }

  const pagination = parsePagination(req.query);
  const result = await searchUserNotes({ userId: user._id, query: trimmed, ...pagination });

  return res.json({
    error: false,
    ...result,
    message: "Notes matching the search query retrieved successfully.",
  });
});

exports.getAttachment = asyncHandler(async (req, res) => {
  const { noteId, attachmentId } = req.params;
  const { user } = req.user;

  const note = await Note.findOne({ _id: noteId, userId: user._id });
  if (!note) {
    return res.status(404).json({ error: true, message: "Note not found." });
  }

  const attachment = await findNoteAttachment(noteId, attachmentId);
  if (!attachment) {
    return res.status(404).json({ error: true, message: "Attachment not found." });
  }

  res.set({
    "Content-Type": attachment.fileType,
    "Content-Disposition": attachmentContentDisposition(attachment.name),
    "X-Content-Type-Options": "nosniff",
    "Content-Length": attachment.data.length,
  });

  return res.send(attachment.data);
});
