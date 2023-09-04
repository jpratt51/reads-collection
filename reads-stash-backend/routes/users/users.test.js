"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

let testUserToken;
let test1Username;
let test2Username;

beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1), ('test2', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );
    const testUser = { username: res.rows[0].username, id: res.rows[0].id };
    test2Username = res.rows[1].username;
    test1Username = res.rows[0].username;
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
                email: "test@email.com",
                fname: "tfn",
                id: expect.any(Number),
                lname: "tln",
                totalBooks: null,
                totalPages: null,
                username: "test1",
            },
            {
                exp: null,
                email: "test@email.com",
                fname: "tfn",
                id: expect.any(Number),
                lname: "tln",
                totalBooks: null,
                totalPages: null,
                username: "test2",
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

describe("GET /api/users/:username", () => {
    test("get one user and 200 status code with valid token and valid username", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}`)
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

    test("get error message and 401 status code with no token and valid username", async () => {
        const res = await request(app).get(`/api/users/${test1Username}`);
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code with bad token and valid username", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 404 status code with valid token and invalid username", async () => {
        const res = await request(app)
            .get(`/api/users/barnie`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            error: { message: "User barnie Not Found", status: 404 },
        });
    });
});

describe("PATCH /api/users/:userId", () => {
    test("get error message and 401 status code when sending in valid username, invalid token and valid update user inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/${test1Username}`)
            .set({ _token: "bad token" })
            .send({ lname: "updatedLname" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in invalid username, valid token and valid update user inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/1000`)
            .set({ _token: testUserToken })
            .send({ lname: "updatedLname" });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Cannot Update Other Users", status: 403 },
        });
    });

    test("get error message and 403 status code when sending in invalid username data type, valid token and valid update user inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/bad_type`)
            .set({ _token: testUserToken })
            .send({ lname: "updatedLname" });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Cannot Update Other Users", status: 403 },
        });
    });

    test("get error message and 400 status code when sending in valid username, valid token and invalid update user inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/${test1Username}`)
            .set({ _token: testUserToken })
            .send({ username: "lol" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: [
                    "instance.username does not meet minimum length of 5",
                ],
                status: 400,
            },
        });
    });

    test("get updated user object and 200 status code when sending in valid token, valid username and valid update user inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/${test1Username}`)
            .set({ _token: testUserToken })
            .send({
                fname: "updatedFname",
                exp: 100,
            });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            email: "test@email.com",
            exp: null,
            fname: "updatedFname",
            id: expect.any(Number),
            lname: "tln",
            exp: 100,
            totalBooks: null,
            totalPages: null,
            username: test1Username,
        });
    });
});

describe("DELETE /api/users", () => {
    test("get error message and 403 status code if valid token and other user's username", async () => {
        const res = await request(app)
            .delete(`/api/users/${test2Username}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Cannot Delete Other Users", status: 403 },
        });
    });

    test("get error message and 401 status code if invalid token and current user's username", async () => {
        const res = await request(app)
            .delete(`/api/users/updatedUsername`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token and bad data type username", async () => {
        const res = await request(app)
            .delete(`/api/users/bad_type`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Cannot Delete Other Users", status: 403 },
        });
    });

    test("get deleted user message and 200 status code if valid token and valid username", async () => {
        const res = await request(app)
            .delete(`/api/users/${test1Username}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ msg: expect.stringContaining("Deleted") });
    });
});
