import apiClient from "./client";

function uploadConfig(onUploadProgress) {
  return {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (!onUploadProgress || !progressEvent.total) return;
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onUploadProgress(progress);
    },
  };
}

export async function fetchNotes({ page = 1, limit = 12 } = {}) {
  const response = await apiClient.get("/get-all-notes", {
    params: { page, limit },
  });
  return response.data;
}

export async function searchNotes({ query, page = 1, limit = 12 }) {
  const response = await apiClient.get("/search-notes", {
    params: { query, page, limit },
  });
  return response.data;
}

export async function createNote(formData, onUploadProgress) {
  const response = await apiClient.post("/add-note", formData, uploadConfig(onUploadProgress));
  return response.data;
}

export async function updateNote(noteId, formData, onUploadProgress) {
  const response = await apiClient.put(
    `/edit-note/${noteId}`,
    formData,
    uploadConfig(onUploadProgress)
  );
  return response.data;
}

export async function deleteNote(noteId) {
  const response = await apiClient.delete(`/delete-note/${noteId}`);
  return response.data;
}

export async function togglePinNote(noteId, isPinned) {
  const response = await apiClient.put(`/update-note-pinned/${noteId}`, { isPinned });
  return response.data;
}
