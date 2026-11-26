const Note = require("../models/note.model");
const { escapeRegex } = require("../utils/regex");

/**
 * Normalize tags from JSON body or multipart form-data ('tags' / 'tags[]').
 * Returns undefined when tags were not supplied in the request body.
 */
function parseTags(body = {}) {
  const raw = body.tags !== undefined ? body.tags : body["tags[]"];
  if (raw === undefined) return undefined;

  if (Array.isArray(raw)) {
    return raw.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((tag) => String(tag).trim()).filter(Boolean);
      }
    } catch {
      // Fall through to comma-separated parsing.
    }
    return trimmed
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

/**
 * Normalize one or more attachment IDs queued for deletion.
 */
function parseDeleteAttachmentIds(rawIds) {
  if (!rawIds) return [];
  const list = Array.isArray(rawIds) ? rawIds : [rawIds];
  return list.filter(Boolean).map(String);
}

/**
 * Fetch paginated notes for a user ordered by pinned status and recency.
 */
async function listUserNotes({ userId, page, limit, skip }) {
  const filter = { userId };
  const [notes, total] = await Promise.all([
    Note.find(filter).sort({ isPinned: -1, updatedAt: -1 }).skip(skip).limit(limit),
    Note.countDocuments(filter),
  ]);

  return {
    notes,
    page,
    limit,
    total,
    hasMore: skip + notes.length < total,
  };
}

/**
 * Search paginated notes for a user across title, content, and tags.
 */
async function searchUserNotes({ userId, query, page, limit, skip }) {
  const pattern = new RegExp(escapeRegex(query), "i");
  const filter = {
    userId,
    $or: [{ title: pattern }, { content: pattern }, { tags: pattern }],
  };

  const [notes, total] = await Promise.all([
    Note.find(filter).sort({ isPinned: -1, updatedAt: -1 }).skip(skip).limit(limit),
    Note.countDocuments(filter),
  ]);

  return {
    notes,
    page,
    limit,
    total,
    hasMore: skip + notes.length < total,
  };
}

module.exports = {
  parseTags,
  parseDeleteAttachmentIds,
  listUserNotes,
  searchUserNotes,
};
