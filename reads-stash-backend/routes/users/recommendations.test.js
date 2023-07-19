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
let recId1, recId2, recId3;

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

    const recIds = await db.query(
        `INSERT INTO recommendations (recommendation, receiver_id, sender_id) VALUES ('recommendation from test1 to test2', $1, $2), ('recommendation from test2 to test1', $2, $1), ('recommendation from test2 to test3', $3, $1) RETURNING id`,
        [test2UserId, testUserId, test3UserId]
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

describe("GET /api/users/:userId/recommendations", () => {
    test("get all user recommendations and 200 status code with valid token and current user id. Should not get recommendation where neither the sender or receiver id matches the current user's id.", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/recommendations`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                id: expect.any(Number),
                receiverId: test2UserId,
                recommendation: "recommendation from test1 to test2",
                senderId: testUserId,
            },
            {
                id: expect.any(Number),
                receiverId: testUserId,
                recommendation: "recommendation from test2 to test1",
                senderId: test2UserId,
            },
        ]);
    });

    test("get error message and 401 status code if no token sent and current user id", async () => {
        const res = await request(app).get(
            `/api/users/${testUserId}/recommendations`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code if bad token sent and current user id", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/recommendations`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token sent and other user's id", async () => {
        const res = await request(app)
            .get(`/api/users/${test2UserId}/recommendations`)
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

describe("GET /api/users/:userId/recommendations/:recommendationId", () => {
    test("get one user recommendation and 200 status code with valid token, valid user id and valid user recommendation id", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/recommendations/${recId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            id: expect.any(Number),
            receiverId: test2UserId,
            recommendation: "recommendation from test1 to test2",
            senderId: testUserId,
        });
    });

    test("get error message and 401 status code with no token, a valid user id and valid recommendation id", async () => {
        const res = await request(app).get(
            `/api/users/${testUserId}/recommendations/${recId1}`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code with bad token, a valid user id and valid recommendation id", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/recommendations/${recId1}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code with valid token, invalid user id and valid recommendation id", async () => {
        const res = await request(app)
            .get(`/api/users/${test2UserId}/recommendations/${recId3}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Recommendations",
                status: 403,
            },
        });
    });

    test("get error message and 403 status code with valid token, invalid userId parameter type and valid recommendation id", async () => {
        const res = await request(app)
            .get(`/api/users/bad_type/recommendations/${recId1}`)
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

describe("PATCH /api/users/:userId", () => {
    test("get updated user recommendation object and 200 status code when sending in valid token, valid userId, valid recommendation id and valid user recommendation input", async () => {
        const res = await request(app)
            .patch(`/api/users/${testUserId}/recommendations/${recId1}`)
            .set({ _token: testUserToken })
            .send({ recommendation: "updated recommendation" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            id: expect.any(Number),
            receiverId: test2UserId,
            recommendation: "updated recommendation",
            senderId: testUserId,
        });
    });

    test("get error message and 401 status code when sending in invalid token, valid user id, valid recommendation id and valid update recommendation input", async () => {
        const res = await request(app)
            .patch(`/api/users/${testUserId}/recommendations/${recId1}`)
            .set({ _token: "bad token" })
            .send({ recommendation: "update recommendation?" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid user id, valid recommendation id and valid update recommendation input", async () => {
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

    test("get error message and 403 status code when sending in valid token, invalid user id data type, valid recommendation id and valid update recommendation input", async () => {
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

    test("get error message and 400 status code when sending in valid token, valid user id, valid recommendation id and invalid update recommendation input", async () => {
        const res = await request(app)
            .patch(`/api/users/${testUserId}/recommendations/${recId1}`)
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

// describe("DELETE /api/users", () => {
//     test("get error message and 403 status code if valid token and other user's id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/${test2UserId}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: { message: "Cannot Delete Other Users", status: 403 },
//         });
//     });

//     test("get error message and 401 status code if invalid token and current user's id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/${testUserId}`)
//             .set({ _token: "bad token" });
//         expect(res.statusCode).toBe(401);
//         expect(res.body).toEqual({
//             error: { message: "Unauthorized", status: 401 },
//         });
//     });

//     test("get error message and 403 status code if valid token and bad data type user id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/bad_type`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: { message: "Cannot Delete Other Users", status: 403 },
//         });
//     });

//     test("get deleted user message and 200 status code if valid token and valid user id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/${testUserId}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({ msg: expect.stringContaining("Deleted") });
//     });
// });
