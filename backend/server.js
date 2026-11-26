const { getGeminiApiKey, getMongoUrl, getPort } = require("./src/config/env");
const { connectDatabase } = require("./src/config/db");
const app = require("./src/app");

if (!getGeminiApiKey()) {
  console.warn("WARNING: GEMINI_API_KEY is not defined. AI Summarizer will not work.");
}

async function start() {
  try {
    await connectDatabase(getMongoUrl());
    console.log("DB Connected");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }

  const port = getPort();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = app;
