import axios from "axios";

const baseUrl = (import.meta.env.VITE_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function apiMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export { baseUrl };
export default apiClient;
