const mongoose = require("mongoose");

/**
 * Connect to MongoDB using the provided connection string.
 */
async function connectDatabase(mongoUrl) {
  if (!mongoUrl) {
    throw new Error("MONGO_URL is not defined. The server will not start.");
  }

  await mongoose.connect(mongoUrl);
  return mongoose.connection;
}

module.exports = { connectDatabase };
