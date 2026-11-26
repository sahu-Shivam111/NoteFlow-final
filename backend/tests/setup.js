process.env.NODE_ENV = "test";
process.env.ACCESS_TOKEN_SECRET = "test-secret-key";
process.env.GEMINI_API_KEY = "test-key";

const assert = require("node:assert/strict");
const { after, before, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../src/app");

let mongo;

function setupTestDatabase() {
  before(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });

  beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
  });
}

async function registerUser(email) {
  const response = await request(app).post("/create-user").send({
    firstName: "Ada",
    lastName: "Lovelace",
    email,
    password: "secret1",
  });
  assert.equal(response.status, 200);
  return response.body.accessToken;
}

module.exports = {
  app,
  setupTestDatabase,
  registerUser,
};
