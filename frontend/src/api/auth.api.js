import apiClient from "./client";

export async function loginUser({ email, password }) {
  const response = await apiClient.post("/login", { email, password });
  return response.data;
}

export async function registerUser({ firstName, lastName, email, password }) {
  const response = await apiClient.post("/create-user", {
    firstName,
    lastName,
    email,
    password,
  });
  return response.data;
}

export async function fetchCurrentUser() {
  const response = await apiClient.get("/get-user");
  return response.data;
}
