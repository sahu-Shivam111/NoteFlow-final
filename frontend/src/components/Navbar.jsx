import { useEffect, useRef, useState } from "react";
import { FaRegStickyNote } from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import ProfileInfo from "./ProfileInfo";
import SearchBar from "./SearchBar";

export default function Navbar({ userInfo, handleSearch, getAllNotes }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode, toggleTheme } = useTheme();
  const isInitialMount = useRef(true);
  const navigate = useNavigate();

  const clearSearch = () => {
    setSearchQuery("");
    if (getAllNotes) getAllNotes();
  };

  const handleIconClick = () => {
    const token = localStorage.getItem("token");
    token ? navigate("/dashboard") : navigate("/login");
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return undefined;
    }

    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else if (getAllNotes) {
        getAllNotes();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, handleSearch, getAllNotes]);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/75 shadow-sm backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-950/75">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          onClick={handleIconClick}
          className="flex items-center gap-3 text-left"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30">
            <FaRegStickyNote size={18} />
          </span>
          <span className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            NoteFlow
          </span>
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2 md:max-w-3xl md:justify-end">
          {userInfo && (
            <div className="min-w-0 flex-1 md:max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                clearSearch={clearSearch}
              />
            </div>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </button>

          {userInfo && <ProfileInfo userInfo={userInfo} />}
        </div>
      </div>
    </nav>
  );
}
