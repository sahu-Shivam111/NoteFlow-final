import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

export default function SearchBar({ value, onChange, clearSearch }) {
  return (
    <div className="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50/90 px-3.5 py-2.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:bg-slate-900">
      <FaMagnifyingGlass className="shrink-0 text-slate-400" size={14} />
      <input
        type="text"
        placeholder="Search notes"
        className="ml-3 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
        value={value}
        onChange={onChange}
        aria-label="Search notes"
      />
      {value && (
        <button
          type="button"
          onClick={clearSearch}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Clear search"
        >
          <IoMdClose size={16} />
        </button>
      )}
    </div>
  );
}
