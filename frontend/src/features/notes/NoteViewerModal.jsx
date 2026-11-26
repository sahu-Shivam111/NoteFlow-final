import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  MdAutoAwesome,
  MdClose,
  MdCode,
  MdDescription,
  MdFileDownload,
  MdPictureAsPdf,
} from "react-icons/md";
import { summarizeNote } from "../../api/ai.api";
import { downloadAttachment, loadAttachmentUrl } from "../../api/attachments.api";
import AttachmentImage from "./AttachmentImage";
import AttachmentPreview from "./AttachmentPreview";
import { exportNoteAsJSON, exportNoteAsMarkdown, exportNoteAsPDF } from "./exportNote";

export default function NoteViewerModal({ note, onCloseNote, onSummaryUpdated }) {
  const [previewFile, setPreviewFile] = useState(null);
  const [summary, setSummary] = useState(note?.summary || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [retryTimer, setRetryTimer] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    setSummary(note?.summary || "");
    setPreviewFile(null);
  }, [note?._id, note?.summary]);

  useEffect(() => {
    if (retryTimer <= 0) return undefined;
    const interval = setInterval(() => {
      setRetryTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [retryTimer]);

  useEffect(() => {
    if (!previewFile || !note?._id) {
      setPreviewUrl("");
      return undefined;
    }

    let cancelled = false;
    loadAttachmentUrl(note._id, previewFile)
      .then((url) => {
        if (!cancelled) setPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewUrl("");
          toast.error("Could not load this file.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [previewFile, note?._id]);

  const handleDownload = async (event, attachment) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await downloadAttachment(note._id, attachment);
    } catch {
      toast.error("Could not download this file.");
    }
  };

  const handleSummarize = async () => {
    if (isGenerating || retryTimer > 0) return;

    setIsGenerating(true);
    try {
      const data = await summarizeNote(note._id);
      if (data && data.summary) {
        setSummary(data.summary);
        if (onSummaryUpdated) {
          onSummaryUpdated(note._id, data.summary);
        }
        toast.success("Summary generated!");
      }
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.data?.retryAfter;
        const seconds = retryAfter ? parseInt(retryAfter.toString().replace("s", ""), 10) || 60 : 60;
        setRetryTimer(seconds);
      }

      if (error.response?.status === 409) {
        toast.error("Summarization is already running for this note.");
        return;
      }

      const errorMsg = error.response?.data?.message || "Failed to generate summary";
      if (
        retryTimer === 0 &&
        (errorMsg.toLowerCase().includes("limit") || errorMsg.toLowerCase().includes("quota"))
      ) {
        setRetryTimer(60);
      }

      toast.error(errorMsg, { duration: 4000 });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!note) return null;

  return (
    <div className="relative mx-auto flex h-[95vh] w-full max-w-[98vw] flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-colors duration-300 dark:bg-gray-800 md:p-8 lg:max-w-[95vw]">
      <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />

      {previewFile ? (
        <AttachmentPreview
          file={previewFile}
          previewUrl={previewUrl}
          onBack={() => setPreviewFile(null)}
          onClose={onCloseNote}
          onDownload={handleDownload}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col animate-in fade-in duration-300">
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-700/80">
            <div className="min-w-0 flex-1">
              <h3 className="break-words text-2xl font-bold text-gray-800 dark:text-gray-200 md:text-3xl">
                {note.title}
              </h3>
              <p className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                {new Date(note.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseNote}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              aria-label="Close note preview"
            >
              <MdClose size={22} />
            </button>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-2"
            style={{ scrollbarWidth: "thin" }}
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSummarize}
                disabled={isGenerating || retryTimer > 0}
                className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MdAutoAwesome className={isGenerating ? "animate-spin" : ""} size={18} />
                <span className="text-sm font-medium">
                  {isGenerating ? "AI is Thinking..." : retryTimer > 0 ? "AI Limited" : "AI Summarize"}
                </span>
              </button>
              {retryTimer > 0 && (
                <div className="mt-1 text-[10px] font-bold text-red-500 animate-pulse">
                  Ready in {retryTimer}s
                </div>
              )}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => exportNoteAsPDF(note, summary)}
                  title="Export PDF"
                  className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <MdPictureAsPdf size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => exportNoteAsMarkdown(note)}
                  title="Export Markdown"
                  className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                >
                  <MdDescription size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => exportNoteAsJSON(note)}
                  title="Export JSON"
                  className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <MdCode size={20} />
                </button>
              </div>
            </div>

          <div className="attachments-section mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {note.attachments &&
              note.attachments.map((att, idx) => (
                <div
                  key={att.attachmentId || idx}
                  onClick={() =>
                    (att.fileType.startsWith("image/") || att.fileType === "application/pdf") &&
                    setPreviewFile(att)
                  }
                  className={`group flex items-center justify-between overflow-hidden rounded-xl border bg-gray-50 p-3 transition-all dark:border-gray-600 dark:bg-gray-700/50 ${
                    att.fileType.startsWith("image/") || att.fileType === "application/pdf"
                      ? "cursor-pointer hover:border-blue-400 dark:hover:border-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {att.fileType.startsWith("image/") ? (
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-slate-200">
                        <AttachmentImage
                          noteId={note._id}
                          attachment={att}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <MdPictureAsPdf
                          size={24}
                          className={
                            att.fileType === "application/pdf" ? "text-red-500" : "text-blue-500"
                          }
                        />
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium dark:text-gray-200">
                        {att.name}
                      </span>
                      <span className="truncate text-[10px] uppercase text-gray-400">
                        {att.fileType === "application/pdf" || att.fileType.startsWith("image/")
                          ? "Click to preview"
                          : "Download only"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => handleDownload(event, att)}
                    className="flex-shrink-0 p-2 text-gray-400 transition-colors hover:text-blue-500"
                    aria-label={`Download ${att.name}`}
                  >
                    <MdFileDownload size={20} />
                  </button>
                </div>
              ))}
          </div>

          {summary && (
            <div className="group relative mb-8 overflow-hidden break-words rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm dark:border-blue-800/50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="absolute right-0 top-0 p-3 opacity-10 transition-opacity group-hover:opacity-20">
                <MdAutoAwesome size={40} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="mb-3 flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300">
                <MdAutoAwesome className="text-blue-500" />
                AI Smart Summary
              </h4>
              <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {summary}
              </div>
            </div>
          )}

          <div
            className="ql-editor prose mb-6 max-w-none overflow-x-hidden break-words rounded-xl border border-gray-100 bg-gray-50 p-6 text-base leading-relaxed text-gray-700 dark:prose-invert dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
