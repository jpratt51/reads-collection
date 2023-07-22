"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

let testUserToken;

let testUserId, test2UserId, test3UserId;

beforeAll(async () => {
    await db.query("DELETE FROM users;");

    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1), ('test2', 'tfn', 'tln', 'test@email.com', $1), ('test3', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );

    const testUser = { username: res.rows[0].username, id: res.rows[0].id };

    testUserId = res.rows[0].id;
    test2UserId = res.rows[1].id;
    test3UserId = res.rows[2].id;

    await db.query(
        `INSERT INTO users_followed (user_id, followed_id) VALUES ($1, $2), ($1, $3), ($2, $3) RETURNING id`,
        [testUserId, test2UserId, test3UserId]
    );

    testUserToken = jwt.sign(testUser, SECRET_KEY);
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.end();
});

describe("GET /api/users/:userId/followers", () => {
    test("get all user's followed and 200 status code with valid token and current user id. Should not get other user's followed.", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/followed`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                email: "test@email.com",
                exp: null,
                fname: "tfn",
                followedId: test2UserId,
                lname: "tln",
                totalBooks: null,
                totalPages: null,
                userId: testUserId,
            },
            {
                email: "test@email.com",
                exp: null,
                fname: "tfn",
                followedId: test3UserId,
                lname: "tln",
                totalBooks: null,
                totalPages: null,
                userId: testUserId,
            },
        ]);
    });

    test("get error message and 401 status code if no token sent and current user id", async () => {
        const res = await request(app).get(`/api/users/${testUserId}/followed`);
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code if bad token sent and current user id", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/followed`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token sent and other user's id", async () => {
        const res = await request(app)
            .get(`/api/users/${test2UserId}/followed`)
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

describe("GET /api/users/:userId/followers/:followedId", () => {
    test("get one user followed and 200 status code with valid token, valid user id and valid user followed id", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/followed/${test2UserId}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            email: "test@email.com",
            exp: null,
            fname: "tfn",
            followedId: test2UserId,
            lname: "tln",
            totalBooks: null,
            totalPages: null,
            userId: testUserId,
        });
    });

    test("get error message and 401 status code with no token, a valid user id and valid followed id", async () => {
        const res = await request(app).get(
            `/api/users/${testUserId}/followed/${test2UserId}`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code with bad token, a valid user id and valid followed id", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/followed/${test2UserId}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code with valid token, invalid user id and valid followed id", async () => {
        const res = await request(app)
            .get(`/api/users/${test2UserId}/followed/${test3UserId}`)
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
            .get(`/api/users/bad_type/followed/${testUserId}`)
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
    test("get error message and 401 status code when sending in invalid token, valid userId and valid followedId", async () => {
        const res = await request(app)
            .post(`/api/users/${testUserId}/followed`)
            .set({ _token: "bad token" })
            .send({
                followedId: test2UserId,
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid userId and valid followedId", async () => {
        const res = await request(app)
            .post(`/api/users/1000/followed`)
            .set({ _token: testUserToken })
            .send({
                followedId: test2UserId,
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Followed Users",
                status: 403,
            },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid userId data type and valid followedId", async () => {
        const res = await request(app)
            .post(`/api/users/bad_type/followed`)
            .set({ _token: testUserToken })
            .send({
                followedId: test2UserId,
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Followed Users",
                status: 403,
            },
        });
    });

    test("get error message and 400 status code when sending in valid token, valid userId and invalid followedId", async () => {
        const res = await request(app)
            .post(`/api/users/${testUserId}/followed`)
            .set({ _token: testUserToken })
            .send({ followedId: "nope" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: ["instance.followedId is not of a type(s) integer"],
                status: 400,
            },
        });
    });

    test("get created followed user and 201 status code when sending in valid token, valid userId and valid followedId", async () => {
        const res = await request(app)
            .post(`/api/users/${testUserId}/followed`)
            .set({ _token: testUserToken })
            .send({
                followedId: test2UserId,
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            email: "test@email.com",
            exp: null,
            fname: "tfn",
            followedId: test2UserId,
            lname: "tln",
            totalBooks: null,
            totalPages: null,
            userId: testUserId,
        });
    });
});
