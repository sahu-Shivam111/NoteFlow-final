const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  AI_REQUEST_TIMEOUT_MS,
  getGeminiApiKey,
  getGeminiModel,
} = require("../config/env");

function createHttpError(statusCode, message, extra = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  Object.assign(error, extra);
  return error;
}

function buildSummaryPrompt({ title, plainTextContent, attachmentsText }) {
  return `
      You are a professional note-taking assistant. I need a concise summary of the following note.
      
      TITLE: ${title}
      CONTENT: ${plainTextContent}
      ${attachmentsText ? `ATTACHED DOCUMENT CONTENT: ${attachmentsText}` : ""}
      
      INSTRUCTIONS:
      - Provide a summary in 3-5 bullet points.
      - Pull out any key actions or deadlines if they exist.
      - If there are attached documents, integrate their key information into the summary.
      - Use professional and clear language.
      - Formatting: Use Markdown bullet points.
    `;
}

function mapGeminiError(error) {
  if (error.statusCode) {
    return error;
  }

  if (error.name === "AbortError") {
    return createHttpError(504, "AI response timed out. Please try again.");
  }

  if (error.status === 429 || (error.message && error.message.includes("quota"))) {
    const retryAfter = error.errorDetails?.find((detail) =>
      detail["@type"]?.includes("RetryInfo")
    )?.retryDelay;

    return createHttpError(
      429,
      retryAfter
        ? `AI limit reached. Please wait ${retryAfter} before retrying.`
        : "AI limit reached. Please wait a minute before trying again.",
      { retryAfter }
    );
  }

  if (error.status === 401 || error.status === 403) {
    return createHttpError(503, "Gemini API authentication failed. Check GEMINI_API_KEY.");
  }

  if (error.status === 404) {
    return createHttpError(
      503,
      "The configured Gemini model is unavailable. Check GEMINI_MODEL in the backend environment."
    );
  }

  if ([500, 502, 503].includes(error.status)) {
    return createHttpError(503, "The AI service is temporarily busy. Please try again later.");
  }

  return createHttpError(
    500,
    "An error occurred while generating the summary. Please try again later."
  );
}

/**
 * Generate a Markdown bullet-point summary for a note via Google Gemini.
 */
async function generateNoteSummary({ title, plainTextContent, attachmentsText }) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw createHttpError(
      503,
      "AI summarization is not configured. Add GEMINI_API_KEY to the backend environment."
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: getGeminiModel() });
    const prompt = buildSummaryPrompt({ title, plainTextContent, attachmentsText });
    const result = await model.generateContent(prompt, { timeout: AI_REQUEST_TIMEOUT_MS });
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Summarization Error:", error);
    throw mapGeminiError(error);
  }
}

module.exports = {
  buildSummaryPrompt,
  generateNoteSummary,
};
