import { useEffect, useState } from "react";
import { loadAttachmentUrl } from "../../api/attachments.api";

export default function AttachmentImage({ noteId, attachment, className, alt = "" }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (!attachment?.fileType?.startsWith("image/")) {
      setSrc("");
      return undefined;
    }

    loadAttachmentUrl(noteId, attachment)
      .then((url) => {
        if (!cancelled) setSrc(url || "");
      })
      .catch(() => {
        if (!cancelled) setSrc("");
      });

    return () => {
      cancelled = true;
    };
  }, [noteId, attachment]);

  if (!src) return null;

  return <img src={src} className={className} alt={alt} />;
}
