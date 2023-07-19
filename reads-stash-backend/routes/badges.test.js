"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

let testUserToken;
let testBadgeId;

beforeAll(async () => {
    await db.query("DELETE FROM users;");
    await db.query("DELETE FROM badges;");
    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );
    const testUser = { username: res.username, id: res.id };
    testUserToken = jwt.sign(testUser, SECRET_KEY);

    const testBadges = await db.query(
        `INSERT INTO badges (name, thumbnail) VALUES ('testBadge', 'testThumbnail'), ('testBadge2', 'testThumbnail2') RETURNING *`
    );
    testBadgeId = testBadges.rows[0].id;
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.query("DELETE FROM badges;");
    await db.end();
});

describe("GET /api/badges", () => {
    test("get all badges and 200 status code with correct token", async () => {
        const res = await request(app)
            .get("/api/badges")
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                id: expect.any(Number),
                name: "testBadge",
                thumbnail: "testThumbnail",
            },
            {
                id: expect.any(Number),
                name: "testBadge2",
                thumbnail: "testThumbnail2",
            },
        ]);
    });

    test("get error and 401 status code without authorization token", async () => {
        const res = await request(app).get("/api/badges");
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error and 401 status code when sending fake token", async () => {
        const res = await request(app)
            .get("/api/badges")
            .set({ _token: "faketoken" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });
});

describe("GET /api/badges/:badgeId", () => {
    test("get badge object and 200 status code with correct token and valid badge id request parameter", async () => {
        const res = await request(app)
            .get(`/api/badges/${testBadgeId}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            id: expect.any(Number),
            name: "testBadge",
            thumbnail: "testThumbnail",
        });
    });

    test("get error message and 401 status code with no token and valid badge id request parameter", async () => {
        const res = await request(app).get(`/api/badges/${testBadgeId}`);
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: {
                message: "Unauthorized",
                status: 401,
            },
        });
    });

    test("get error message and 404 status code with correct token and incorrect data type for badge id request parameter", async () => {
        const res = await request(app)
            .get(`/api/badges/badType`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: "Invalid badge id data type",
                status: 400,
            },
        });
    });
});