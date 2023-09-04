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
let recId1, recId2, recId3;

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

    const recIds = await db.query(
        `INSERT INTO recommendations (recommendation, receiver_username, sender_username) VALUES ('recommendation from test1 to test2', $1, $2), ('recommendation from test2 to test1', $2, $1), ('recommendation from test2 to test3', $3, $1) RETURNING id`,
        [test2Username, test1Username, test3Username]
    );

    recId1 = recIds.rows[0].id;
    recId2 = recIds.rows[1].id;
    recId3 = recIds.rows[2].id;

    testUserToken = jwt.sign(testUser, SECRET_KEY);
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.end();
});

describe("GET /api/users/:username/recommendations", () => {
    test("get all user recommendations and 200 status code with valid token and current username. Should not get recommendation where neither the sender or receiver username matches the current username.", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/recommendations`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                id: expect.any(Number),
                receiverUsername: "test2",
                recommendation: "recommendation from test1 to test2",
                senderUsername: "test1",
            },
            {
                id: expect.any(Number),
                receiverUsername: "test1",
                recommendation: "recommendation from test2 to test1",
                senderUsername: "test2",
            },
        ]);
    });

    test("get error message and 401 status code if no token sent and current username", async () => {
        const res = await request(app).get(
            `/api/users/${test1Username}/recommendations`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code if bad token sent and current username", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/recommendations`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token sent and other username", async () => {
        const res = await request(app)
            .get(`/api/users/${test2Username}/recommendations`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Recommendations",
                status: 403,
            },
        });
    });
});

describe("GET /api/users/:username/recommendations/:recommendationId", () => {
    test("get one user recommendation and 200 status code with valid token, valid username and valid user recommendation id", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/recommendations/${recId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            id: expect.any(Number),
            receiverUsername: test2Username,
            recommendation: "recommendation from test1 to test2",
            senderUsername: test1Username,
        });
    });

    test("get error message and 401 status code with no token, a valid username and valid recommendation id", async () => {
        const res = await request(app).get(
            `/api/users/${test1Username}/recommendations/${recId1}`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code with bad token, a valid username and valid recommendation id", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/recommendations/${recId1}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code with valid token, invalid username and valid recommendation id", async () => {
        const res = await request(app)
            .get(`/api/users/${test2Username}/recommendations/${recId3}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Recommendations",
                status: 403,
            },
        });
    });

    test("get error message and 403 status code with valid token, incorrect username and valid recommendation id", async () => {
        const res = await request(app)
            .get(`/api/users/incorrect/recommendations/${recId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Recommendations",
                status: 403,
            },
        });
    });
});

describe("POST /api/users/:username/recommendations", () => {
    test("get created user recommendation object and 201 status code when sending in valid token, valid username, valid receiverUsername and valid user recommendation", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/recommendations`)
            .set({ _token: testUserToken })
            .send({
                recommendation: "test recommendation",
                receiverUsername: test2Username,
                senderUsername: test1Username,
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            id: expect.any(Number),
            receiverUsername: test2Username,
            recommendation: "test recommendation",
            senderUsername: test1Username,
        });
    });

    test("get error message and 401 status code when sending in invalid token, valid username, valid receiverUsername and valid user recommendation", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/recommendations`)
            .set({ _token: "bad token" })
            .send({
                recommendation: "test recommendation?",
                receiverUsername: test2Username,
                senderUsername: test1Username,
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid username, valid receiverUsername and valid recommendation input", async () => {
        const res = await request(app)
            .post(`/api/users/1000/recommendations`)
            .set({ _token: testUserToken })
            .send({
                recommendation: "test recommendation?",
                receiverUsername: test2Username,
                senderUsername: test1Username,
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot Create Recommendations From Other Users",
                status: 403,
            },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid username data type, valid receiverUsername and valid recommendation input", async () => {
        const res = await request(app)
            .post(`/api/users/bad_type/recommendations`)
            .set({ _token: testUserToken })
            .send({
                recommendation: "test recommendation?",
                receiverUsername: test2Username,
                senderUsername: test1Username,
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot Create Recommendations From Other Users",
                status: 403,
            },
        });
    });

    test("get error message and 400 status code when sending in valid token, valid username and invalid recommendation input", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/recommendations`)
            .set({ _token: testUserToken })
            .send({ badInput: "nope" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: [
                    'instance requires property "recommendation"',
                    'instance requires property "receiverUsername"',
                    'instance requires property "senderUsername"',
                ],
                status: 400,
            },
        });
    });
});

describe("PATCH /api/users/:username/recommendations/:recommendationId", () => {
    test("get updated user recommendation object and 200 status code when sending in valid token, valid username, valid recommendation id and valid user recommendation input", async () => {
        const res = await request(app)
            .patch(`/api/users/${test1Username}/recommendations/${recId1}`)
            .set({ _token: testUserToken })
            .send({ recommendation: "updated recommendation" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            id: expect.any(Number),
            receiverUsername: test2Username,
            recommendation: "updated recommendation",
            senderUsername: test1Username,
        });
    });

    test("get error message and 401 status code when sending in invalid token, valid username, valid recommendation id and valid update recommendation input", async () => {
        const res = await request(app)
            .patch(`/api/users/${test1Username}/recommendations/${recId1}`)
            .set({ _token: "bad token" })
            .send({ recommendation: "update recommendation?" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid username, valid recommendation id and valid update recommendation input", async () => {
        const res = await request(app)
            .patch(`/api/users/1000/recommendations/${recId1}`)
            .set({ _token: testUserToken })
            .send({ recommendation: "update recommendation?" });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot Update Recommendations From Other Users",
                status: 403,
            },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid username data type, valid recommendation id and valid update recommendation input", async () => {
        const res = await request(app)
            .patch(`/api/users/bad_type/recommendations/${recId1}`)
            .set({ _token: testUserToken })
            .send({ recommendation: "update recommendation?" });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot Update Recommendations From Other Users",
                status: 403,
            },
        });
    });

    test("get error message and 400 status code when sending in valid token, valid username, valid recommendation id and invalid update recommendation input", async () => {
        const res = await request(app)
            .patch(`/api/users/${test1Username}/recommendations/${recId1}`)
            .set({ _token: testUserToken })
            .send({ recommendation: 12345 });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: ["instance.recommendation is not of a type(s) string"],
                status: 400,
            },
        });
    });
});

describe("DELETE /api/users/:username/recommendations/:recommendationId", () => {
    test("get error message and 403 status code if valid token, other username and valid recommendation id", async () => {
        const res = await request(app)
            .delete(`/api/users/${test2Username}/recommendations/${recId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Invalid Username",
                status: 403,
            },
        });
    });

    test("get error message and 401 status code if invalid token, valid username and valid recommendation id", async () => {
        const res = await request(app)
            .delete(`/api/users/${test1Username}/recommendations/${recId1}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token, bad data type username and valid recommendation id", async () => {
        const res = await request(app)
            .delete(`/api/users/bad_type/recommendations/${recId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Invalid Username", status: 403 },
        });
    });

    test("get deleted user recommendation message and 200 status code if valid token, valid username and valid recommendation id", async () => {
        const res = await request(app)
            .delete(`/api/users/${test1Username}/recommendations/${recId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ msg: expect.stringContaining("Deleted") });
    });
});
