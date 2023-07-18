"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

let testUserToken;

beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("secret", 1);
    const result = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );
    const testUser = { username: result.username, id: result.id };
    testUserToken = jwt.sign(testUser, SECRET_KEY);
});

describe("POST /register", function () {
    test("returns token", async function () {
        const response = await request(app).post("/api/auth/register").send({
            username: "test2",
            fname: "t2fn",
            lname: "t2ln",
            email: "t2@email.com",
            password: "password",
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ token: expect.any(String) });
    });
});

afterEach(async () => {});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.end();
});
