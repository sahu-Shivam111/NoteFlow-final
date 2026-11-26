import apiClient from "./client";

export async function summarizeNote(noteId) {
  const response = await apiClient.post(`/api/ai/summarize/${noteId}`, {}, { timeout: 60000 });
  return response.data;
}
