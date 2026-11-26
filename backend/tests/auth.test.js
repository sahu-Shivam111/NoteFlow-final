const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const jwt = require("jsonwebtoken");
const request = require("supertest");

const { app, setupTestDatabase, registerUser } = require("./setup");

setupTestDatabase();

describe("auth and account", () => {
  test("login rejects a wrong password and issues a 7 day token", async () => {
    await registerUser("ada@example.com");

    const denied = await request(app).post("/login").send({
      email: "ada@example.com",
      password: "wrong-password",
    });
    assert.equal(denied.status, 400);

    const allowed = await request(app).post("/login").send({
      email: "ada@example.com",
      password: "secret1",
    });
    assert.equal(allowed.status, 200);
    assert.ok(allowed.body.accessToken);

    const decoded = jwt.decode(allowed.body.accessToken);
    const lifetime = decoded.exp - decoded.iat;
    assert.equal(lifetime, 7 * 24 * 60 * 60);

    const profile = await request(app)
      .get("/get-user")
      .set("Authorization", `Bearer ${allowed.body.accessToken}`);
    assert.equal(profile.status, 200);
    assert.ok(profile.body.user.createdAt);
    assert.equal(profile.body.user.createdOn, undefined);
  });

  test("a token in the query string is not accepted", async () => {
    const token = await registerUser("query@example.com");
    const response = await request(app).get(`/get-user?token=${token}`);
    assert.equal(response.status, 401);
  });
});
