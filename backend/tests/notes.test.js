const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const jwt = require("jsonwebtoken");
const request = require("supertest");

const { app, setupTestDatabase, registerUser } = require("./setup");
const Note = require("../src/models/note.model");
const Attachment = require("../src/models/attachment.model");

setupTestDatabase();

describe("notes", () => {
  test("another user cannot delete a note", async () => {
    const owner = await registerUser("owner@example.com");
    const stranger = await registerUser("stranger@example.com");

    const created = await request(app)
      .post("/add-note")
      .set("Authorization", `Bearer ${owner}`)
      .send({ title: "Private", content: "Keep out", tags: ["gym"] });
    assert.equal(created.status, 200);

    const removed = await request(app)
      .delete(`/delete-note/${created.body.note._id}`)
      .set("Authorization", `Bearer ${stranger}`);
    assert.equal(removed.status, 404);

    const stillThere = await request(app)
      .get("/get-all-notes")
      .set("Authorization", `Bearer ${owner}`);
    assert.equal(stillThere.body.notes.length, 1);
  });

  test("search escapes regex input and matches tags", async () => {
    const token = await registerUser("search@example.com");
    await request(app)
      .post("/add-note")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Plan", content: "Meet at noon", tags: ["gym"] });

    const hostile = await request(app)
      .get("/search-notes")
      .query({ query: "(a+)+" })
      .set("Authorization", `Bearer ${token}`);
    assert.equal(hostile.status, 200);
    assert.equal(hostile.body.notes.length, 0);

    const byTag = await request(app)
      .get("/search-notes")
      .query({ query: "gym" })
      .set("Authorization", `Bearer ${token}`);
    assert.equal(byTag.status, 200);
    assert.equal(byTag.body.notes.length, 1);
  });

  test("notes are paginated", async () => {
    const token = await registerUser("pages@example.com");
    const decoded = jwt.decode(token);

    await Note.insertMany(
      Array.from({ length: 13 }, (_, index) => ({
        title: `Note ${index}`,
        content: `Body ${index}`,
        userId: decoded.user._id,
        tags: [],
      }))
    );

    const first = await request(app)
      .get("/get-all-notes")
      .query({ page: 1, limit: 12 })
      .set("Authorization", `Bearer ${token}`);
    assert.equal(first.status, 200);
    assert.equal(first.body.notes.length, 12);
    assert.equal(first.body.hasMore, true);
    assert.equal(first.body.total, 13);

    const second = await request(app)
      .get("/get-all-notes")
      .query({ page: 2, limit: 12 })
      .set("Authorization", `Bearer ${token}`);
    assert.equal(second.body.notes.length, 1);
    assert.equal(second.body.hasMore, false);
  });

  test("attachment download requires the header token and a safe filename", async () => {
    const token = await registerUser("files@example.com");
    const decoded = jwt.decode(token);
    const note = await Note.create({
      title: "File",
      content: "Has a file",
      userId: decoded.user._id,
    });
    const attachment = await Attachment.create({
      noteId: note._id,
      name: 'evil".png\r\n',
      fileType: "image/png",
      size: 4,
      data: Buffer.from("test"),
    });

    const denied = await request(app).get(
      `/get-attachment/${note._id}/${attachment._id}?token=${token}`
    );
    assert.equal(denied.status, 401);

    const allowed = await request(app)
      .get(`/get-attachment/${note._id}/${attachment._id}`)
      .set("Authorization", `Bearer ${token}`);
    assert.equal(allowed.status, 200);
    assert.match(allowed.headers["content-disposition"], /filename="evil.png"/);
    assert.doesNotMatch(allowed.headers["content-disposition"], /[\r\n]/);
  });

  test("summarize rejects a note that is already running", async () => {
    const token = await registerUser("ai@example.com");
    const decoded = jwt.decode(token);
    const note = await Note.create({
      title: "Long enough title",
      content: "This note is definitely long enough to summarize without calling the model.",
      userId: decoded.user._id,
      isSummarizing: true,
    });

    const response = await request(app)
      .post(`/api/ai/summarize/${note._id}`)
      .set("Authorization", `Bearer ${token}`);
    assert.equal(response.status, 409);
  });

  test("invalid noteId returns 400 instead of 500", async () => {
    const token = await registerUser("invalidid@example.com");
    const response = await request(app)
      .delete("/delete-note/not-an-object-id")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(response.status, 400);
    assert.equal(response.body.error, true);
  });
});
