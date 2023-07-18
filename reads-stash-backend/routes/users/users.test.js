"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

let testUserToken;
let testUserId;

beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );
    const testUser = { username: res.rows[0].username, id: res.rows[0].id };
    testUserId = res.rows[0].id;
    testUserToken = jwt.sign(testUser, SECRET_KEY);
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.end();
});

describe("GET /api/users", () => {
    test("get all users and 200 status code with valid token", async () => {
        const res = await request(app)
            .get("/api/users")
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                exp: null,
                fname: "tfn",
                id: expect.any(Number),
                lname: "tln",
                totalBooks: null,
                totalPages: null,
                username: "test1",
            },
        ]);
    });

    test("get error message and 401 status code if no token sent", async () => {
        const res = await request(app).get("/api/users");
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code if bad token sent", async () => {
        const res = await request(app)
            .get("/api/users")
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });
});

describe("GET /api/users/:userId", () => {
    test("get one user and 200 status code with valid token and valid user id", async () => {
        console.log(testUserId);
        const res = await request(app)
            .get(`/api/users/${testUserId}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            email: "test@email.com",
            exp: null,
            fname: "tfn",
            id: expect.any(Number),
            lname: "tln",
            totalBooks: null,
            totalPages: null,
            username: "test1",
        });
    });

    test("get error message and 401 status code with no token and valid user id", async () => {
        console.log(testUserId);
        const res = await request(app).get(`/api/users/${testUserId}`);
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code with bad token and valid user id", async () => {
        console.log(testUserId);
        const res = await request(app)
            .get(`/api/users/${testUserId}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 404 status code with valid token and invalid user id", async () => {
        console.log(testUserId);
        const res = await request(app)
            .get(`/api/users/1000`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            error: { message: "User 1000 not found", status: 404 },
        });
    });

    test("get error message and 400 status code with valid token and invalid userId parameter type", async () => {
        console.log(testUserId);
        const res = await request(app)
            .get(`/api/users/badType`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: { message: "Invalid user id data type", status: 400 },
        });
    });
});
