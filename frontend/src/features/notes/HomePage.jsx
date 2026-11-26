import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../../api/auth.api";
import { apiMessage } from "../../api/client";
import { deleteNote, fetchNotes, searchNotes, togglePinNote } from "../../api/notes.api";
import Navbar from "../../components/Navbar";
import Toast from "../../components/Toast";
import NoteCard from "./NoteCard";

const NoteEditorModal = lazy(() => import("./NoteEditorModal"));
const NoteViewerModal = lazy(() => import("./NoteViewerModal"));

function ModalFallback() {
  return (
    <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
      Loading…
    </div>
  );
}

export default function HomePage() {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [openViewNoteModal, setOpenViewNoteModal] = useState({
    isShown: false,
    note: null,
  });

  const [showToast, setShowToast] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [userInfo, setUserInfo] = useState(null);
  const [notes, setNotes] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef("");
  const pageRef = useRef(1);
  const requestRef = useRef(0);

  const getUserInfo = useCallback(async () => {
    try {
      const data = await fetchCurrentUser();

      if (data.error) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (data.user) {
        setUserInfo(data.user);
      }
    } catch (error) {
      if (error?.response?.status === 401) return;
      toast.error(apiMessage(error, "Could not load your account."));
    }
  }, [navigate]);

  const loadNotes = useCallback(async ({ page = 1, append = false, query } = {}) => {
    const activeQuery = query !== undefined ? query : searchRef.current;
    const requestId = ++requestRef.current;
    setLoadingNotes(true);

    try {
      const data = activeQuery
        ? await searchNotes({ query: activeQuery, page, limit: 12 })
        : await fetchNotes({ page, limit: 12 });

      if (requestId !== requestRef.current) return;

      const incoming = data.notes || [];
      setNotes((current) => (append ? [...current, ...incoming] : incoming));
      setHasMore(Boolean(data.hasMore));
      pageRef.current = page;
      setIsSearching(Boolean(activeQuery));
      setNotesError("");
    } catch (error) {
      if (requestId !== requestRef.current) return;
      const message = apiMessage(error, "Could not load notes. Please try again.");
      setNotesError(message);
      toast.error(message);
    } finally {
      if (requestId === requestRef.current) setLoadingNotes(false);
    }
  }, []);

  const getAllNotes = useCallback(() => {
    searchRef.current = "";
    return loadNotes({ page: 1, append: false, query: "" });
  }, [loadNotes]);

  const handleEditNote = (note) => {
    setOpenAddEditModal({ isShown: true, type: "edit", data: note });
  };

  const handleShowToast = (message, type) => {
    setShowToast({ isShown: true, message, type });
  };

  const handleDeleteNote = async (note) => {
    try {
      const data = await deleteNote(note._id);
      if (!data.error) {
        loadNotes({ page: 1, append: false });
        handleShowToast("Note Deleted Successfully", "delete");
      }
    } catch (error) {
      toast.error(apiMessage(error, "Could not delete this note."));
    }
  };

  const onPinNote = async (note) => {
    const nextPinned = !note.isPinned;
    try {
      const data = await togglePinNote(note._id, nextPinned);

      if (data.error) {
        toast.error(data.message || "Could not update this note.");
        return;
      }

      loadNotes({ page: 1, append: false });
      handleShowToast(nextPinned ? "Note pinned" : "Note unpinned", "add");
    } catch (error) {
      toast.error(apiMessage(error, "Could not update this note."));
    }
  };

  const handleSearch = useCallback(
    (searchQuery) => {
      const trimmed = searchQuery.trim();
      searchRef.current = trimmed;
      if (!trimmed) return getAllNotes();
      return loadNotes({ page: 1, append: false, query: trimmed });
    },
    [getAllNotes, loadNotes]
  );

  const loadMore = () => {
    if (!hasMore || loadingNotes) return;
    loadNotes({ page: pageRef.current + 1, append: true });
  };

  const handleViewNote = (note) => {
    setOpenViewNoteModal({ isShown: true, note });
  };

  const handleSummaryUpdated = (noteId, summary) => {
    setNotes((current) =>
      current.map((item) => (item._id === noteId ? { ...item, summary } : item))
    );
    setOpenViewNoteModal((current) =>
      current.note?._id === noteId
        ? { ...current, note: { ...current.note, summary } }
        : current
    );
  };

  useEffect(() => {
    getUserInfo();
    getAllNotes();
  }, [getUserInfo, getAllNotes]);

  const openNewNote = () =>
    setOpenAddEditModal({ isShown: true, type: "add", data: null });

  const libraryLabel = isSearching
    ? `${notes.length}${hasMore ? "+" : ""} result${notes.length === 1 ? "" : "s"}`
    : `${notes.length}${hasMore ? "+" : ""} note${notes.length === 1 ? "" : "s"}`;

  return (
    <>
      <Navbar userInfo={userInfo} handleSearch={handleSearch} getAllNotes={getAllNotes} />

      <main className="mx-auto min-h-screen max-w-7xl px-4 pb-28 pt-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Your library</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {userInfo?.firstName ? `${userInfo.firstName}'s notes` : "Notes"}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{libraryLabel}</p>
          </div>
          <button
            type="button"
            onClick={openNewNote}
            className="hidden items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-blue-600 dark:bg-white dark:text-slate-900 dark:hover:bg-blue-400 sm:inline-flex"
          >
            <MdAdd className="text-xl" />
            New note
          </button>
        </div>

        {notesError && (
          <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {notesError}
          </p>
        )}

        {loadingNotes && notes.length === 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-3xl border border-slate-200/70 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70"
              />
            ))}
          </div>
        )}

        {!loadingNotes && notes.length === 0 && !notesError && (
          <div className="mx-auto mt-6 max-w-md rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/60">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              <MdAdd className="text-3xl" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">
              {isSearching ? "Nothing matches that search" : "Your library is empty"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {isSearching
                ? "Try a shorter phrase, or clear the search to see every note."
                : "Start with a title, a few lines, and a tag. You can attach files later."}
            </p>
            {!isSearching && (
              <button
                type="button"
                onClick={openNewNote}
                className="mt-6 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Write a note
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              noteId={note._id}
              title={note.title}
              date={new Date(note?.createdAt || new Date()).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              content={note.content}
              tags={note.tags}
              isPinned={note.isPinned}
              attachments={note.attachments}
              onEdit={() => handleEditNote(note)}
              onDelete={() => handleDeleteNote(note)}
              onPinNote={() => onPinNote(note)}
              onClick={() => handleViewNote(note)}
            />
          ))}
        </div>
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingNotes}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {loadingNotes ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </main>

      <button
        type="button"
        onClick={openNewNote}
        className="fixed bottom-6 right-5 z-40 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/30 outline-none transition hover:scale-105 sm:hidden"
        aria-label="New note"
      >
        <MdAdd className="text-[32px]" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 9999,
          },
        }}
        contentLabel=""
        className="mx-auto mt-10 max-h-[86vh] w-[92%] overflow-y-auto rounded-3xl bg-transparent shadow-2xl outline-none md:w-[560px]"
      >
        {openAddEditModal.isShown && (
          <Suspense fallback={<ModalFallback />}>
            <NoteEditorModal
              type={openAddEditModal.type}
              noteData={openAddEditModal.data}
              onClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
              getAllNotes={getAllNotes}
              showToast={handleShowToast}
            />
          </Suspense>
        )}
      </Modal>

      <Modal
        isOpen={openViewNoteModal.isShown}
        onRequestClose={() => setOpenViewNoteModal({ isShown: false, note: null })}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.75)",
            zIndex: 1000,
          },
        }}
        contentLabel=""
        className="mx-auto my-auto flex max-h-[98vh] w-[98%] items-center justify-center overflow-hidden rounded-2xl bg-transparent focus:outline-none md:w-[95%]"
      >
        {openViewNoteModal.isShown && (
          <Suspense fallback={<ModalFallback />}>
            <NoteViewerModal
              note={openViewNoteModal.note}
              onCloseNote={() => setOpenViewNoteModal({ isShown: false, note: null })}
              onSummaryUpdated={handleSummaryUpdated}
            />
          </Suspense>
        )}
      </Modal>

      <Toast
        isShown={showToast.isShown}
        message={showToast.message}
        onClose={() => setShowToast({ isShown: false, message: "", type: "" })}
        type={showToast.type}
      />
    </>
  );
}
