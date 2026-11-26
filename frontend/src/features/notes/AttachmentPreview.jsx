import { MdChevronLeft, MdClose, MdDescription } from "react-icons/md";

export default function AttachmentPreview({ file, previewUrl, onBack, onClose, onDownload }) {
  return (
    <div className="flex h-full flex-col animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Back to note"
          >
            <MdChevronLeft size={28} />
          </button>
          <h4 className="truncate text-xl font-semibold dark:text-gray-200">{file.name}</h4>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            aria-label="Close note preview"
          >
            <MdClose size={22} />
          </button>
        )}
      </div>

      <div className="relative flex-1 overflow-hidden rounded-xl bg-slate-100 dark:bg-gray-900">
        {file.fileType.startsWith("image/") ? (
          <img src={previewUrl} className="h-full w-full object-contain" alt={file.name} />
        ) : file.fileType === "application/pdf" ? (
          <iframe
            src={previewUrl ? `${previewUrl}#toolbar=0` : undefined}
            className="h-full w-full border-none"
            title="PDF Preview"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <MdDescription size={64} />
            <p className="mt-4">Preview not available for this file type</p>
            <button
              type="button"
              onClick={(event) => onDownload(event, file)}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Download to View
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
