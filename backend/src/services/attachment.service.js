const fs = require("fs");
const path = require("path");
const Attachment = require("../models/attachment.model");
const { extractPdfText } = require("./pdf.service");

/**
 * Persist uploaded Multer files as Attachment documents and return Note metadata entries.
 */
async function createAttachmentsForNote(noteId, files = []) {
  const metadata = [];

  for (const file of files) {
    const attachment = new Attachment({
      noteId,
      name: file.originalname,
      fileType: file.mimetype,
      size: file.size,
      data: file.buffer,
    });
    await attachment.save();
    metadata.push({
      attachmentId: attachment._id,
      name: file.originalname,
      fileType: file.mimetype,
      size: file.size,
    });
  }

  return metadata;
}

/**
 * Delete specific attachments belonging to a note.
 */
async function deleteAttachmentsByIds(noteId, attachmentIds = []) {
  for (const id of attachmentIds) {
    await Attachment.deleteOne({ _id: id, noteId });
  }
}

/**
 * Delete all attachments linked to a note.
 */
async function deleteAllNoteAttachments(noteId) {
  return Attachment.deleteMany({ noteId });
}

/**
 * Fetch a single attachment belonging to a note.
 */
async function findNoteAttachment(noteId, attachmentId) {
  return Attachment.findOne({ _id: attachmentId, noteId });
}

/**
 * Extract combined text from all PDF attachments on a note.
 */
async function extractPdfAttachmentsText(attachments = []) {
  let combinedText = "";

  for (const meta of attachments) {
    if (meta.fileType !== "application/pdf") continue;

    let dataBuffer = null;

    if (meta.attachmentId) {
      const attachment = await Attachment.findById(meta.attachmentId);
      if (attachment) dataBuffer = attachment.data;
    }

    if (!dataBuffer && meta.url) {
      const filePath = path.join(__dirname, "..", "..", meta.url);
      if (fs.existsSync(filePath)) {
        dataBuffer = fs.readFileSync(filePath);
      }
    }

    if (dataBuffer) {
      const text = await extractPdfText(dataBuffer);
      combinedText += `\n[Content from Attachment: ${meta.name}]\n${text}`;
    }
  }

  return combinedText;
}

module.exports = {
  createAttachmentsForNote,
  deleteAttachmentsByIds,
  deleteAllNoteAttachments,
  findNoteAttachment,
  extractPdfAttachmentsText,
};
