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
        `INSERT INTO users_followers (user_id, follower_id) VALUES ($1, $2), ($1, $3), ($2, $3) RETURNING id`,
        [testUserId, test2UserId, test3UserId]
    );

    testUserToken = jwt.sign(testUser, SECRET_KEY);
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.end();
});

describe("GET /api/users/:userId/followers", () => {
    test("get all user followers and 200 status code with valid token and current user id. Should not get other user's followers.", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/followers`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                email: "test@email.com",
                exp: null,
                fname: "tfn",
                followerId: test2UserId,
                lname: "tln",
                totalBooks: null,
                totalPages: null,
                userId: testUserId,
            },
            {
                email: "test@email.com",
                exp: null,
                fname: "tfn",
                followerId: test3UserId,
                lname: "tln",
                totalBooks: null,
                totalPages: null,
                userId: testUserId,
            },
        ]);
    });

    test("get error message and 401 status code if no token sent and current user id", async () => {
        const res = await request(app).get(
            `/api/users/${testUserId}/followers`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code if bad token sent and current user id", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/followers`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token sent and other user's id", async () => {
        const res = await request(app)
            .get(`/api/users/${test2UserId}/followers`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Followers",
                status: 403,
            },
        });
    });
});

describe("GET /api/users/:userId/followers/:followerId", () => {
    test("get one user follower and 200 status code with valid token, valid user id and valid user journal id", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/followers/${test2UserId}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            email: "test@email.com",
            exp: null,
            fname: "tfn",
            followerId: test2UserId,
            lname: "tln",
            totalBooks: null,
            totalPages: null,
            userId: testUserId,
        });
    });

    test("get error message and 401 status code with no token, a valid user id and valid follower id", async () => {
        const res = await request(app).get(
            `/api/users/${testUserId}/followers/${test2UserId}`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code with bad token, a valid user id and valid follower id", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/journals/${test2UserId}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code with valid token, invalid user id and valid journal id", async () => {
        const res = await request(app)
            .get(`/api/users/${test2UserId}/followers/${test3UserId}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other Users Followers",
                status: 403,
            },
        });
    });

    test("get error message and 403 status code with valid token, invalid userId parameter type and valid follower id", async () => {
        const res = await request(app)
            .get(`/api/users/bad_type/followers/${testUserId}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other Users Followers",
                status: 403,
            },
        });
    });
});
