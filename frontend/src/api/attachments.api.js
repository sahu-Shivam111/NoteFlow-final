import apiClient, { baseUrl } from "./client";

const cache = new Map();

function legacyUrl(attachment) {
  if (!attachment?.url) return "";
  return `${baseUrl}/${String(attachment.url).replace(/\\/g, "/")}`;
}

export async function loadAttachmentUrl(noteId, attachment) {
  if (!attachment) return "";
  if (!attachment.attachmentId || !noteId) return legacyUrl(attachment);

  const key = `${noteId}:${attachment.attachmentId}`;
  const cached = cache.get(key);
  if (typeof cached === "string") return cached;
  if (cached) return cached;

  const pending = apiClient
    .get(`/get-attachment/${noteId}/${attachment.attachmentId}`, {
      responseType: "blob",
    })
    .then((response) => {
      const url = URL.createObjectURL(response.data);
      cache.set(key, url);
      return url;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, pending);
  return pending;
}

export async function downloadAttachment(noteId, attachment) {
  const url = await loadAttachmentUrl(noteId, attachment);
  if (!url) throw new Error("Attachment is unavailable.");

  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.name || "download";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
