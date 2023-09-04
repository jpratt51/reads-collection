"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

let testUserToken;

let test1Username, test2Username, collectionId1, collectionId3;

beforeAll(async () => {
    await db.query("DELETE FROM users;");

    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1), ('test2', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );

    const testUser = { username: res.rows[0].username, id: res.rows[0].id };
    testUserToken = jwt.sign(testUser, SECRET_KEY);

    test1Username = res.rows[0].username;
    test2Username = res.rows[1].username;

    const collectionIds = await db.query(
        `INSERT INTO collections (name, user_username) VALUES ('test collection name 1', $1), ('test collection name 2', $1), ('test collection name 3', $2) RETURNING id`,
        [test1Username, test2Username]
    );

    collectionId1 = collectionIds.rows[0].id;
    collectionId3 = collectionIds.rows[2].id;
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.end();
});

describe("GET /api/users/:username/collections", () => {
    test("get all user collections and 200 status code with valid token and current user username. Should not get other user's collections.", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/collections`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            { id: expect.any(Number), name: "test collection name 1" },
            { id: expect.any(Number), name: "test collection name 2" },
        ]);
    });

    test("get error message and 401 status code if no token sent with current user username", async () => {
        const res = await request(app).get(
            `/api/users/${test1Username}/collections`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code if bad token sent with current user username", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/collections`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token sent with other user's username", async () => {
        const res = await request(app)
            .get(`/api/users/${test2Username}/collections`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Incorrect Username",
                status: 403,
            },
        });
    });
});

describe("GET /api/users/:username/collections/:collectionId", () => {
    test("get one user collection and 200 status code with valid token, valid user username and valid user collection id", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/collections/${collectionId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            id: expect.any(Number),
            name: "test collection name 1",
        });
    });

    test("get error message and 401 status code with no token, a valid user username and valid collection id", async () => {
        const res = await request(app).get(
            `/api/users/${test1Username}/collections/${collectionId1}`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code with bad token, a valid user username and valid collection id", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/collections/${collectionId1}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code with valid token, invalid user username and valid collection id", async () => {
        const res = await request(app)
            .get(`/api/users/${test2Username}/collections/${collectionId3}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Incorrect Username",
                status: 403,
            },
        });
    });

    test("get error message and 403 status code with valid token, incorrect user username and valid collection id", async () => {
        const res = await request(app)
            .get(`/api/users/incorrect/collections/${collectionId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Incorrect Username",
                status: 403,
            },
        });
    });
});

describe("POST /api/users/:username/collections", () => {
    test("get error message and 401 status code when sending in invalid token, valid user username and valid user collection inputs", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/collections`)
            .set({ _token: "bad token" })
            .send({
                name: "test collection insertion",
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in valid token, incorrect user username and valid collection inputs", async () => {
        const res = await request(app)
            .post(`/api/users/incorrect/collections`)
            .set({ _token: testUserToken })
            .send({
                name: "test collection insertion",
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Incorrect Username",
                status: 403,
            },
        });
    });

    test("get error message and 400 status code when sending in valid token, valid user username and invalid collection inputs", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/collections`)
            .set({ _token: testUserToken })
            .send({
                name: 12345,
            });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: ["instance.name is not of a type(s) string"],
                status: 400,
            },
        });
    });

    test("get created user collection object and 201 status code when sending in valid token, valid user username and valid user collection inputs", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/collections`)
            .set({ _token: testUserToken })
            .send({
                name: "test collection insertion",
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            id: expect.any(Number),
            name: "test collection insertion",
        });
    });
});

describe("PATCH /api/users/:username/collections/:collectionId", () => {
    test("get error message and 401 status code when sending in invalid token, valid user username and valid update collection inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/${test1Username}/collections/${collectionId1}`)
            .set({ _token: "bad token" })
            .send({
                name: "test collection insertion",
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid user username and valid update collection inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/1000/collections/${collectionId1}`)
            .set({ _token: testUserToken })
            .send({
                name: "test collection insertion",
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Incorrect Username", status: 403 },
        });
    });

    test("get error message and 403 status code when sending in valid token, incorrect user username and valid update collection inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/incorrect/collections/${collectionId1}`)
            .set({ _token: testUserToken })
            .send({
                name: "test collection insertion",
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Incorrect Username", status: 403 },
        });
    });

    test("get error message and 400 status code when sending in valid token, valid user username and invalid update collection inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/${test1Username}/collections/${collectionId1}`)
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

    test("get updated user collection object and 200 status code when sending in valid token, valid user username and valid user collection inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/${test1Username}/collections/${collectionId1}`)
            .set({ _token: testUserToken })
            .send({
                name: "test collection insertion",
            });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            id: expect.any(Number),
            name: "test collection insertion",
        });
    });
});

describe("DELETE /api/users/:username/collections/:collectionId", () => {
    test("get error message and 403 status code if valid token, other user's username and valid collection id", async () => {
        const res = await request(app)
            .delete(`/api/users/${test2Username}/collections/${collectionId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Incorrect Username", status: 403 },
        });
    });

    test("get error message and 401 status code if invalid token, valid user username and valid collection id", async () => {
        const res = await request(app)
            .delete(`/api/users/${test1Username}/collections/${collectionId1}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token, incorrect username and valid collection id", async () => {
        const res = await request(app)
            .delete(`/api/users/incorrect/collections/${collectionId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Incorrect Username", status: 403 },
        });
    });

    test("get deleted user collection message and 200 status code if valid token, valid user username and valid collection id", async () => {
        const res = await request(app)
            .delete(`/api/users/${test1Username}/collections/${collectionId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            msg: `Deleted User Collection ${collectionId1}`,
        });
    });
});
