import { useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";

export default function TagInput({ tags, setTags }) {
  const [tagInput, setTagInput] = useState("");

  const addNewTag = () => {
    const next = tagInput.trim();
    if (next === "" || next.length > 10) return;
    if (tags.length >= 5) return;
    if (tags.includes(next)) return;

    setTags([...tags, next]);
    setTagInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNewTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      {tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
            >
              #{tag}
              <button type="button" onClick={() => handleRemoveTag(tag)} aria-label={`Remove ${tag}`}>
                <MdClose className="text-sm text-blue-400 hover:text-red-500" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          type="text"
          className="flex-grow rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Add a tag, then press Enter"
          maxLength={10}
        />
        <button
          type="button"
          onClick={addNewTag}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-white transition hover:bg-blue-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-blue-400"
          aria-label="Add tag"
        >
          <MdAdd className="text-2xl" />
        </button>
      </div>
    </div>
  );
}
