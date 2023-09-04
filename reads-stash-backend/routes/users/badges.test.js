"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

let testUserToken;

let test1Username,
    test2Username,
    test1BadgeName,
    test2BadgeName,
    test3BadgeName;

beforeAll(async () => {
    await db.query("DELETE FROM users;");
    await db.query("DELETE FROM badges;");

    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1), ('test2', 'tfn', 'tln', 'test@email.com', $1), ('test3', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );

    test1Username = res.rows[0].username;
    test2Username = res.rows[1].username;

    const testUser = { username: res.rows[0].username, id: res.rows[0].id };
    testUserToken = jwt.sign(testUser, SECRET_KEY);

    const badges = await db.query(
        `INSERT INTO badges (name, thumbnail) VALUES ('bronze', 'bronze thumbnail stand in'), ('silver', 'silver thumbnail stand in'), ('golden', 'golden thumbnail stand in') RETURNING name;`
    );

    test1BadgeName = badges.rows[0].name;
    test2BadgeName = badges.rows[1].name;
    test3BadgeName = badges.rows[2].name;

    await db.query(
        `INSERT INTO users_badges (user_username, name) VALUES ($1, $3), ($1, $4), ($2, $5)`,
        [
            test1Username,
            test2Username,
            test1BadgeName,
            test2BadgeName,
            test3BadgeName,
        ]
    );
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.query("DELETE FROM badges;");
    await db.end();
});

describe("GET /api/users/:username/badges", () => {
    test("get all user's badges and 200 status code with valid token and current user username. Should not get other user's badges.", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/badges`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            { id: expect.any(Number), username: "test1", name: "bronze" },
            { id: expect.any(Number), username: "test1", name: "silver" },
        ]);
    });

    test("get error message and 401 status code if no token sent with current user username", async () => {
        const res = await request(app).get(
            `/api/users/${test1Username}/badges`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code if bad token sent and current user id", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/badges`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token sent and other user's username", async () => {
        const res = await request(app)
            .get(`/api/users/${test2Username}/badges`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Cannot View Other User's Badges", status: 403 },
        });
    });
});

describe("GET /api/users/:username/badges/:name", () => {
    test("get one user badge and 200 status code with valid token, valid user username and valid badge name", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/badges/${test1BadgeName}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            name: test1BadgeName,
            id: expect.any(Number),
            username: test1Username,
        });
    });

    test("get error message and 401 status code with no token, a valid user username and valid badge name", async () => {
        const res = await request(app).get(
            `/api/users/${test1Username}/badges/${test1BadgeName}`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code with bad token, a valid user username and valid badge name", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/badges/${test1BadgeName}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code with valid token, invalid user username and valid badge name", async () => {
        const res = await request(app)
            .get(`/api/users/${test2Username}/badges/${test1BadgeName}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Cannot View Other User's Badges", status: 403 },
        });
    });

    test("get error message and 403 status code with valid token, incorrect user username parameter type and valid badge name", async () => {
        const res = await request(app)
            .get(`/api/users/incorrect/badges/${test1BadgeName}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Cannot View Other User's Badges", status: 403 },
        });
    });
});

describe("POST /api/users/:username/badges", () => {
    test("get error message and 401 status code when sending in invalid token, valid username and valid badge name", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/badges`)
            .set({ _token: "bad token" })
            .send({
                name: test3BadgeName,
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid username and valid badge name", async () => {
        const res = await request(app)
            .post(`/api/users/1000/badges`)
            .set({ _token: testUserToken })
            .send({
                name: test3BadgeName,
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot Create Badges For Other Users",
                status: 403,
            },
        });
    });

    test("get error message and 400 status code when sending in valid token, valid username and invalid badge name data type", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/badges`)
            .set({ _token: testUserToken })
            .send({
                name: true,
            });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: ["instance.name is not of a type(s) string"],
                status: 400,
            },
        });
    });

    test("get user badge and 201 status code when sending in valid token, valid username and valid badge name", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/badges`)
            .set({ _token: testUserToken })
            .send({
                name: test3BadgeName,
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            id: expect.any(Number),
            name: "golden",
            username: "test1",
        });
    });
});

describe("DELETE /api/users/:userId/badges/:badgeId", () => {
    test("get error message and 403 status code if valid token, other user's username and valid badge name", async () => {
        const res = await request(app)
            .delete(`/api/users/${test2Username}/badges/${test1BadgeName}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot Delete Other User's Badges",
                status: 403,
            },
        });
    });

    test("get error message and 401 status code if invalid token, valid user username and valid badge name", async () => {
        const res = await request(app)
            .delete(`/api/users/${test1Username}/badges/${test1BadgeName}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token, incorrect user username and valid badge name", async () => {
        const res = await request(app)
            .delete(`/api/users/incorrect/badges/${test1BadgeName}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot Delete Other User's Badges",
                status: 403,
            },
        });
    });

    test("get deleted user badge message and 200 status code if valid token, valid user username and valid badge name", async () => {
        const res = await request(app)
            .delete(`/api/users/${test1Username}/badges/${test1BadgeName}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            msg: `Deleted User's Badge ${test1BadgeName}`,
        });
    });
});
