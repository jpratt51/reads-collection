"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

let testUserToken;

let test1Username, test2Username, test3Username;

beforeAll(async () => {
    await db.query("DELETE FROM users;");

    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1), ('test2', 'tfn', 'tln', 'test@email.com', $1), ('test3', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );

    const testUser = { username: res.rows[0].username, id: res.rows[0].id };

    test1Username = res.rows[0].username;
    test2Username = res.rows[1].username;
    test3Username = res.rows[2].username;

    await db.query(
        `INSERT INTO users_followed (user_username, followed_username) VALUES ($1, $2), ($1, $3), ($2, $3) RETURNING id`,
        [test1Username, test2Username, test3Username]
    );

    testUserToken = jwt.sign(testUser, SECRET_KEY);
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.end();
});

describe("GET /api/users/:username/followers", () => {
    test("get all user's followed and 200 status code with valid token and current user username. Should not get other user's followed users.", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/followed`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                email: "test@email.com",
                exp: null,
                fname: "tfn",
                followedUsername: test2Username,
                lname: "tln",
                totalBooks: null,
                totalPages: null,
            },
            {
                email: "test@email.com",
                exp: null,
                fname: "tfn",
                followedUsername: test3Username,
                lname: "tln",
                totalBooks: null,
                totalPages: null,
            },
        ]);
    });

    test("get error message and 401 status code if no token sent with current user username", async () => {
        const res = await request(app).get(
            `/api/users/${test1Username}/followed`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code if bad token sent and current user id", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/followed`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token sent and other user's id", async () => {
        const res = await request(app)
            .get(`/api/users/${test2Username}/followed`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Followed Users",
                status: 403,
            },
        });
    });
});

describe("GET /api/users/:userId/followers/:followedUsername", () => {
    test("get one user followed and 200 status code with valid token, valid user id and valid user followed id", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/followed/${test2Username}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            email: "test@email.com",
            exp: null,
            fname: "tfn",
            followedUsername: test2Username,
            lname: "tln",
            totalBooks: null,
            totalPages: null,
            username: test1Username,
        });
    });

    test("get error message and 401 status code with no token, a valid user id and valid followed id", async () => {
        const res = await request(app).get(
            `/api/users/${test1Username}/followed/${test2Username}`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code with bad token, a valid user id and valid followed id", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/followed/${test2Username}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code with valid token, invalid user id and valid followed id", async () => {
        const res = await request(app)
            .get(`/api/users/${test2Username}/followed/${test3Username}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Followed Users",
                status: 403,
            },
        });
    });

    test("get error message and 403 status code with valid token, invalid userId parameter type and valid followed id", async () => {
        const res = await request(app)
            .get(`/api/users/bad_type/followed/${test1Username}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Followed Users",
                status: 403,
            },
        });
    });
});

describe("POST /api/users/:userId/followed", () => {
    test("get error message and 401 status code when sending in invalid token, valid userId and valid followed username", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/followed`)
            .set({ _token: "bad token" })
            .send({
                followedUsername: test2Username,
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid userId and valid followed username", async () => {
        const res = await request(app)
            .post(`/api/users/1000/followed`)
            .set({ _token: testUserToken })
            .send({
                followedUsername: test2Username,
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Followed Users",
                status: 403,
            },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid userId data type and valid followed username", async () => {
        const res = await request(app)
            .post(`/api/users/bad_type/followed`)
            .set({ _token: testUserToken })
            .send({
                followedUsername: test2Username,
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Followed Users",
                status: 403,
            },
        });
    });

    test("get error message and 400 status code when sending in valid token, valid username and invalid followed username", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/followed`)
            .set({ _token: testUserToken })
            .send({ followedUsername: "hello" });
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            error: { message: "User Not Found", status: 404 },
        });
    });

    test("get created followed user and 201 status code when sending in valid token, valid user username and valid followed username", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/followed`)
            .set({ _token: testUserToken })
            .send({
                followedUsername: test2Username,
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            email: "test@email.com",
            exp: null,
            fname: "tfn",
            followedUsername: test2Username,
            lname: "tln",
            totalBooks: null,
            totalPages: null,
            username: test1Username,
        });
    });
});

describe("DELETE /api/users/:username/followed/:followedUsername", () => {
    test("get error message and 403 status code if valid token, other user's username and valid followed username", async () => {
        const res = await request(app)
            .delete(`/api/users/${test2Username}/followed/${test3Username}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Followed Users",
                status: 403,
            },
        });
    });

    test("get error message and 401 status code if invalid token, valid user username and valid followed username", async () => {
        const res = await request(app)
            .delete(`/api/users/${test1Username}/followed/${test2Username}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token, incorrect username and valid followed username", async () => {
        const res = await request(app)
            .delete(`/api/users/incorrect/followed/${test2Username}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Followed Users",
                status: 403,
            },
        });
    });

    test("get deleted user followed message and 200 status code if valid token, valid user username and valid followed username", async () => {
        const res = await request(app)
            .delete(`/api/users/${test1Username}/followed/${test2Username}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            msg: expect.stringContaining("Stopped Following"),
        });
    });
});
