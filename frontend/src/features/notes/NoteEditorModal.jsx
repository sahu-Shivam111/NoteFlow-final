import { useEffect, useState } from "react";
import { MdAttachFile, MdClose, MdInsertDriveFile } from "react-icons/md";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { apiMessage } from "../../api/client";
import { createNote, updateNote } from "../../api/notes.api";
import AttachmentImage from "./AttachmentImage";
import TagInput from "./TagInput";

export default function NoteEditorModal({
  noteData,
  type,
  getAllNotes,
  onClose,
  showToast,
}) {
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(noteData?.tags || []);
  const [attachments, setAttachments] = useState(noteData?.attachments || []);
  const [newFiles, setNewFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState([]);

  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const urls = newFiles.map((file) =>
      file.type.startsWith("image/") ? URL.createObjectURL(file) : ""
    );
    setFilePreviews(urls);

    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [newFiles]);

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    if (tags.length > 0) {
      tags.forEach((tag) => formData.append("tags[]", tag));
    } else {
      formData.append("tags", "[]");
    }

    newFiles.forEach((file) => formData.append("attachments", file));

    if (deletedAttachmentIds.length > 0) {
      deletedAttachmentIds.forEach((id) => formData.append("deleteAttachmentId", id));
    }

    return formData;
  };

  const addNewNote = async () => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const data = await createNote(buildFormData(), setUploadProgress);
      if (data && data.note) {
        showToast("Note Added Successfully");
        getAllNotes();
        onClose();
      }
    } catch (err) {
      setError(apiMessage(err, "An error occurred while uploading. Please try again."));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const editNote = async () => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const data = await updateNote(noteData?._id, buildFormData(), setUploadProgress);
      if (data && data.note) {
        showToast("Note Updated Successfully");
        getAllNotes();
        onClose();
      }
    } catch (err) {
      setError(apiMessage(err, "An error occurred while updating. Please try again."));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveAttachment = (att) => {
    if (att.attachmentId) {
      setAttachments(attachments.filter((a) => a.attachmentId !== att.attachmentId));
      setDeletedAttachmentIds([...deletedAttachmentIds, att.attachmentId]);
    } else {
      setAttachments(attachments.filter((a) => a.url !== att.url));
    }
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title) {
      setError("Please enter the title");
      return;
    }

    if (!content) {
      setError("Please enter the content");
      return;
    }

    setError("");
    if (type === "edit") {
      editNote();
    } else {
      addNewNote();
    }
  };

  return (
    <div className="relative rounded-3xl bg-white p-6 dark:bg-slate-900 sm:p-7">
      <p className="field-label">{type === "edit" ? "Edit note" : "New note"}</p>
      <button
        type="button"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
        onClick={onClose}
        aria-label="Close"
      >
        <MdClose className="text-xl text-slate-400 hover:text-red-500 dark:text-gray-500" />
      </button>

      <div className="flex flex-col gap-2">
        <label className="field-label mt-5">Title</label>
        <input
          type="text"
          className="border-0 border-b border-slate-200 bg-transparent p-0 pb-2 text-2xl font-semibold tracking-tight text-slate-950 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:text-slate-50"
          placeholder="Title"
          value={title}
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <label className="field-label">Content</label>
        <div className="quill-container overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 dark:border-slate-700 dark:bg-slate-800/60">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Write your note content here..."
            className="text-sm text-slate-950 dark:text-gray-200"
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "clean"],
              ],
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="field-label">Tags</label>
        <TagInput tags={tags} setTags={setTags} />
      </div>

      <div className="mt-4">
        <label className="field-label mb-2 block">Attachments</label>

        <div className="mb-3 flex flex-wrap gap-3">
          {attachments.map((att, idx) => (
            <div
              key={att.attachmentId || idx}
              className="group relative flex items-center gap-2 rounded-lg border bg-slate-100 p-2 dark:border-gray-600 dark:bg-gray-700"
            >
              {att.fileType && att.fileType.startsWith("image/") ? (
                <AttachmentImage
                  noteId={noteData?._id}
                  attachment={att}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <MdInsertDriveFile className="text-3xl text-blue-500" />
              )}
              <div className="max-w-[80px] truncate text-[10px] dark:text-gray-300">
                {att.name}
              </div>
              <button
                type="button"
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleRemoveAttachment(att)}
              >
                <MdClose size={12} />
              </button>
            </div>
          ))}

          {newFiles.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="group relative flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-900/20"
            >
              {file.type.startsWith("image/") && filePreviews[idx] ? (
                <div className="h-10 w-10 overflow-hidden rounded bg-gray-200">
                  <img src={filePreviews[idx]} className="h-full w-full object-cover" alt="" />
                </div>
              ) : (
                <MdInsertDriveFile className="text-3xl text-blue-500" />
              )}
              <div className="max-w-[80px] truncate text-[10px] dark:text-gray-300">
                {file.name}
              </div>
              <button
                type="button"
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                onClick={() => handleRemoveNewFile(idx)}
              >
                <MdClose size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-gray-600 dark:hover:bg-gray-700/50">
          <input
            type="file"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files);
              const combined = [...newFiles, ...files].slice(0, 5);
              if (newFiles.length + files.length > 5) {
                setError("Max 5 files allowed. Only the first 5 have been kept.");
              }
              setNewFiles(combined);
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div className="text-center">
            <MdAttachFile className="mx-auto mb-1 text-2xl text-violet-500" />
            <div className="text-sm font-medium text-violet-500">Upload Files</div>
            <div className="mt-1 text-[10px] text-gray-400">Images, PDFs, Docs (Max 5)</div>
          </div>
        </div>
      </div>

      {error && <p className="pt-4 text-xs font-medium text-red-500">{error}</p>}

      {isUploading && (
        <div className="mt-6">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Uploading {newFiles.length} file(s)...
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {uploadProgress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        className="btn-primary mt-8"
        onClick={handleSave}
        disabled={isUploading}
      >
        {isUploading ? "Uploading…" : type === "edit" ? "Save changes" : "Add note"}
      </button>
    </div>
  );
}
