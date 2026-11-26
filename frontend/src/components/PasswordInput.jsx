import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

export default function PasswordInput({
  password,
  onChange,
  onBlur,
  placeholder,
  id,
  autoComplete = "current-password",
  hasError = false,
  ariaDescribedBy,
  wrapperClassName = "mb-4",
}) {
  const [showPass, setShowPass] = useState(false);

  return (
    <div
      className={`flex items-center rounded-xl border bg-slate-50 px-4 transition-all duration-200 focus-within:bg-white focus-within:ring-4 dark:bg-slate-800/80 dark:focus-within:bg-slate-800 ${
        hasError
          ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/15 dark:border-red-500/80"
          : "border-slate-200 focus-within:border-blue-500 focus-within:ring-blue-500/10 dark:border-slate-700"
      } ${wrapperClassName}`}
    >
      <input
        id={id}
        type={showPass ? "text" : "password"}
        value={password}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder || "Enter your password"}
        autoComplete={autoComplete}
        aria-invalid={hasError}
        aria-describedby={ariaDescribedBy}
        className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
      />
      <button
        type="button"
        onClick={() => setShowPass((current) => !current)}
        className="ml-2 text-slate-400 transition hover:text-blue-600 dark:hover:text-blue-400"
        aria-label={showPass ? "Hide password" : "Show password"}
      >
        {showPass ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
      </button>
    </div>
  );
}
