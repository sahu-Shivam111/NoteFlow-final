/**
 * Build a sanitized Content-Disposition header for inline attachment serving.
 */
function attachmentContentDisposition(filename) {
  const cleaned =
    String(filename || "file")
      .replace(/[\r\n]/g, "")
      .replace(/[/\\]/g, "")
      .replace(/"/g, "")
      .slice(0, 180) || "file";

  return `inline; filename="${cleaned}"; filename*=UTF-8''${encodeURIComponent(cleaned)}`;
}

module.exports = { attachmentContentDisposition };
