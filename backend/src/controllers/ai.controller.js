const { convert } = require("html-to-text");
const Note = require("../models/note.model");
const {
  MIN_AI_CONTENT_LENGTH,
  MAX_AI_CONTENT_LENGTH,
  AI_STUCK_TIMEOUT_MS,
} = require("../config/env");
const { asyncHandler } = require("../utils/asyncHandler");
const { extractPdfAttachmentsText } = require("../services/attachment.service");
const { generateNoteSummary } = require("../services/ai.service");

exports.summarizeNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user.user._id;

  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) {
    return res.status(404).json({ error: true, message: "Note not found or unauthorized" });
  }

  const isStuck =
    note.isSummarizing &&
    Date.now() - new Date(note.updatedAt).getTime() > AI_STUCK_TIMEOUT_MS;

  if (note.isSummarizing && !isStuck) {
    return res.status(409).json({ error: true, message: "Summarization is already in progress" });
  }

  note.isSummarizing = true;
  note.updatedAt = Date.now();
  await note.save();

  try {
    const plainTextContent = convert(note.content, { wordwrap: 130 });

    if (plainTextContent.length < MIN_AI_CONTENT_LENGTH && note.attachments.length === 0) {
      note.isSummarizing = false;
      await note.save();
      return res.status(400).json({
        error: true,
        message: "Note content is too short to summarize (minimum 50 characters required).",
      });
    }

    if (plainTextContent.length > MAX_AI_CONTENT_LENGTH) {
      note.isSummarizing = false;
      await note.save();
      return res.status(400).json({
        error: true,
        message: `Note is too long to summarize (limit: ${MAX_AI_CONTENT_LENGTH} characters). Please shorten it and try again.`,
      });
    }

    const attachmentsText = await extractPdfAttachmentsText(note.attachments);
    const summary = await generateNoteSummary({
      title: note.title,
      plainTextContent,
      attachmentsText,
    });

    note.summary = summary;
    note.isSummarizing = false;
    await note.save();

    return res.json({
      error: false,
      summary,
      message: "Summary generated successfully",
    });
  } catch (error) {
    await Note.findByIdAndUpdate(noteId, { isSummarizing: false });
    throw error;
  }
});
