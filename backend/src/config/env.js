require("dotenv").config();

const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://note-flow-nu-one.vercel.app",
];

function getAllowedOrigins() {
  return (process.env.CORS_ORIGINS || DEFAULT_ORIGINS.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

module.exports = {
  TOKEN_EXPIRES_IN: "7d",
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  MAX_SEARCH_LENGTH: 100,
  MIN_AI_CONTENT_LENGTH: 50,
  MAX_AI_CONTENT_LENGTH: 30000,
  AI_STUCK_TIMEOUT_MS: 2 * 60 * 1000,
  AI_REQUEST_TIMEOUT_MS: 55000,
  DEFAULT_GEMINI_MODEL: "gemini-3.5-flash-lite",
  getPort: () => process.env.PORT || 8000,
  getMongoUrl: () => process.env.MONGO_URL || "",
  getAccessTokenSecret: () => process.env.ACCESS_TOKEN_SECRET || "",
  getGeminiApiKey: () => process.env.GEMINI_API_KEY || "",
  getGeminiModel: () => process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  isTestEnv: () => process.env.NODE_ENV === "test",
  getAllowedOrigins,
};
