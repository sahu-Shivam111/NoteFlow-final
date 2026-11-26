import { useEffect } from "react";
import { MdCheck, MdDeleteOutline } from "react-icons/md";

export default function Toast({ isShown, message, type, onClose }) {
  useEffect(() => {
    if (!isShown) return undefined;
    const timeOut = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timeOut);
    };
  }, [isShown, onClose]);

  if (!isShown) return null;

  const isDelete = type === "delete";

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] w-[min(92vw,360px)] -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            isDelete
              ? "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300"
              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
          }`}
        >
          {isDelete ? <MdDeleteOutline className="text-xl" /> : <MdCheck className="text-xl" />}
        </div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{message}</p>
      </div>
    </div>
  );
}
