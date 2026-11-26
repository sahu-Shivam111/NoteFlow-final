import { MdCreate, MdDelete, MdInsertDriveFile, MdOutlinePushPin, MdPushPin } from "react-icons/md";
import AttachmentImage from "./AttachmentImage";

export default function NoteCard({
  noteId,
  title,
  date,
  content,
  tags,
  isPinned,
  attachments,
  onEdit,
  onDelete,
  onPinNote,
  onClick,
}) {
  const plain = (content || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const preview = plain.length > 140 ? `${plain.slice(0, 140)}…` : plain;

  const stop = (event, action) => {
    event.stopPropagation();
    action();
  };

  return (
    <article
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-3xl border bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:bg-slate-900 ${
        isPinned
          ? "border-amber-200 dark:border-amber-500/40"
          : "border-slate-200/80 dark:border-slate-800"
      }`}
      onClick={onClick}
    >
      {attachments && attachments.length > 0 && (
        <div className="relative flex h-44 items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800">
          {attachments[0].fileType?.startsWith("image/") ? (
            <AttachmentImage
              noteId={noteId}
              attachment={attachments[0]}
              alt="Note attachment"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
              <MdInsertDriveFile size={42} />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {(attachments[0].name || "file").split(".").pop()} file
              </span>
            </div>
          )}
          {attachments.length > 1 && (
            <div className="absolute right-3 top-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              +{attachments.length - 1}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {title}
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-400">{date}</p>
          </div>
          <button
            type="button"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${
              isPinned
                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                : "bg-slate-100 text-slate-400 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:text-slate-200"
            }`}
            onClick={(event) => stop(event, onPinNote)}
            aria-label={isPinned ? "Unpin note" : "Pin note"}
          >
            {isPinned ? <MdPushPin /> : <MdOutlinePushPin />}
          </button>
        </div>

        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {preview || "Empty note"}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {(tags || []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
              >
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
              onClick={(event) => stop(event, onEdit)}
              aria-label="Edit note"
            >
              <MdCreate />
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
              onClick={(event) => stop(event, onDelete)}
              aria-label="Delete note"
            >
              <MdDelete />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
