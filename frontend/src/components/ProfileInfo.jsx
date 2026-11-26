import { useNavigate } from "react-router-dom";
import { getInitials } from "../utils/validators";

export default function ProfileInfo({ userInfo }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!userInfo) return null;

  const name = `${userInfo.firstName} ${userInfo.lastName}`.trim();

  return (
    <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1 pl-1 pr-2 dark:border-slate-700 dark:bg-slate-900 sm:pr-3">
      <div
        className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-semibold text-white"
        title={name}
      >
        {getInitials(name)}
      </div>
      <div className="hidden min-w-0 sm:block">
        <p className="max-w-[9rem] truncate text-sm font-medium text-slate-800 dark:text-slate-100">
          {name}
        </p>
        <button
          type="button"
          className="-ml-1.5 rounded-lg px-1.5 py-0.5 text-xs font-medium text-slate-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600 active:scale-95 dark:text-slate-400 dark:hover:bg-red-500/15 dark:hover:text-red-400"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
      <button
        type="button"
        className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:bg-red-50 hover:text-red-600 active:scale-95 dark:text-slate-300 dark:hover:bg-red-500/15 dark:hover:text-red-400 sm:hidden"
        onClick={handleLogout}
      >
        Log out
      </button>
    </div>
  );
}
