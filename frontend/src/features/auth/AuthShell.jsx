import { FaRegStickyNote } from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useTheme } from "../../context/ThemeContext";

const highlights = [
  ["Keep every idea", "Rich text, tags, and files live on the same note."],
  ["Find it again", "Search the library without leaving the page."],
  ["Cut it down", "Ask for a short summary when a note runs long."],
];

export default function AuthShell({ eyebrow, title, children, footer }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-2xl border border-white/60 bg-white/80 text-slate-600 shadow-sm backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-amber-300 dark:hover:bg-slate-800"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
      </button>

      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center lg:gap-10 lg:px-14 lg:py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900" />
        <div className="absolute -left-16 top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative flex items-center gap-3 text-white">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/30">
            <FaRegStickyNote size={22} />
          </span>
          <span className="text-xl font-semibold tracking-tight">NoteFlow</span>
        </div>

        <div className="relative max-w-md text-white">
          <p className="text-sm font-medium text-blue-100/80">A quieter place for notes</p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">
            Write it once. Find it when it matters.
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map(([heading, copy]) => (
              <li
                key={heading}
                className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur-sm"
              >
                <p className="font-medium">{heading}</p>
                <p className="mt-1 text-sm text-blue-50/80">{copy}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-blue-100/70">Your notes stay tied to your account.</p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <FaRegStickyNote size={20} />
            </span>
            <span className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              NoteFlow
            </span>
          </div>

          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{eyebrow}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>

          <div className="mt-7 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-card backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 sm:p-7">
            {children}
          </div>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {footer}
          </div>
        </div>
      </main>
    </div>
  );
}
