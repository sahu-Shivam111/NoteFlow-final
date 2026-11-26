process.env.NODE_ENV = "test";
process.env.ACCESS_TOKEN_SECRET = "test-secret-key";

const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const request = require("supertest");

const app = require("../src/app");
const { escapeRegex } = require("../src/utils/regex");
const { attachmentContentDisposition } = require("../src/utils/headers");

describe("request boundaries", () => {
  test("cors allows the local app and rejects other origins", async () => {
    const allowed = await request(app).get("/").set("Origin", "http://localhost:5173");
    assert.equal(allowed.headers["access-control-allow-origin"], "http://localhost:5173");

    const blocked = await request(app).get("/").set("Origin", "http://evil.example");
    assert.notEqual(blocked.headers["access-control-allow-origin"], "http://evil.example");
  });

  test("regex and download header helpers stay literal", () => {
    assert.equal(escapeRegex("(a+)+"), "\\(a\\+\\)\\+");
    const header = attachmentContentDisposition('say "hi"\r\n.exe');
    assert.match(header, /filename="say hi.exe"/);
    assert.doesNotMatch(header, /[\r\n]/);
  });
});
