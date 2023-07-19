"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

let testUserToken,
    testUserId,
    test2UserId,
    readId1,
    readId2,
    userReadId1,
    userReadId2;

beforeAll(async () => {
    await db.query("DELETE FROM users;");

    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1), ('test2', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );

    const testUser = { username: res.rows[0].username, id: res.rows[0].id };

    testUserId = res.rows[0].id;
    test2UserId = res.rows[1].id;

    const readIds = await db.query(
        `INSERT INTO reads (title, isbn) VALUES ('test title', '1243567119'), ('test 2 title', '1243567819') RETURNING id`
    );

    readId1 = readIds.rows[0].id;
    readId2 = readIds.rows[1].id;

    const userReadIds = await db.query(
        `INSERT INTO users_reads (user_id, read_id) VALUES ($1, $2), ($1, $3) RETURNING id`,
        [testUserId, readId1, readId2]
    );

    userReadId1 = userReadIds.rows[0].id;
    userReadId2 = userReadIds.rows[1].id;

    testUserToken = jwt.sign(testUser, SECRET_KEY);
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.end();
});

describe("GET /api/users/:userId/reads", () => {
    test("get all user reads and 200 status code with valid token and valid user id.", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/reads`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                id: expect.any(Number),
                rating: null,
                readId: readId1,
                reviewDate: null,
                reviewText: null,
                userId: testUserId,
            },
            {
                id: expect.any(Number),
                rating: null,
                readId: readId2,
                reviewDate: null,
                reviewText: null,
                userId: testUserId,
            },
        ]);
    });

    test("Get error message and 401 status code if valid user id is sent but no token.", async () => {
        const res = await request(app).get(`/api/users/${testUserId}/reads`);
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("Get error message and 401 status code if bad token is sent along with valid user id.", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/reads`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("Get error message and 403 status code if valid token is sent along with another user's id.", async () => {
        const res = await request(app)
            .get(`/api/users/${test2UserId}/reads`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Reads",
                status: 403,
            },
        });
    });
});

// describe("GET /api/users/:userId/recommendations/:recommendationId", () => {
//     test("get one user recommendation and 200 status code with valid token, valid user id and valid user recommendation id", async () => {
//         const res = await request(app)
//             .get(`/api/users/${testUserId}/recommendations/${recId1}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({
//             id: expect.any(Number),
//             receiverId: test2UserId,
//             recommendation: "recommendation from test1 to test2",
//             senderId: testUserId,
//         });
//     });

//     test("get error message and 401 status code with no token, a valid user id and valid recommendation id", async () => {
//         const res = await request(app).get(
//             `/api/users/${testUserId}/recommendations/${recId1}`
//         );
//         expect(res.statusCode).toBe(401);
//         expect(res.body).toEqual({
//             error: { message: "Unauthorized", status: 401 },
//         });
//     });

//     test("get error message and 401 status code with bad token, a valid user id and valid recommendation id", async () => {
//         const res = await request(app)
//             .get(`/api/users/${testUserId}/recommendations/${recId1}`)
//             .set({ _token: "bad token" });
//         expect(res.statusCode).toBe(401);
//         expect(res.body).toEqual({
//             error: { message: "Unauthorized", status: 401 },
//         });
//     });

//     test("get error message and 403 status code with valid token, invalid user id and valid recommendation id", async () => {
//         const res = await request(app)
//             .get(`/api/users/${test2UserId}/recommendations/${recId3}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot View Other User's Recommendations",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 403 status code with valid token, invalid userId parameter type and valid recommendation id", async () => {
//         const res = await request(app)
//             .get(`/api/users/bad_type/recommendations/${recId1}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot View Other User's Recommendations",
//                 status: 403,
//             },
//         });
//     });
// });

// describe("POST /api/users/:userId/recommendations", () => {
//     test("get created user recommendation object and 201 status code when sending in valid token, valid userId, valid receiverId and valid user recommendation", async () => {
//         const res = await request(app)
//             .post(`/api/users/${testUserId}/recommendations`)
//             .set({ _token: testUserToken })
//             .send({
//                 recommendation: "test recommendation",
//                 receiverId: test2UserId,
//                 senderId: testUserId,
//             });
//         expect(res.statusCode).toBe(201);
//         expect(res.body).toEqual({
//             id: expect.any(Number),
//             receiverId: test2UserId,
//             recommendation: "test recommendation",
//             senderId: testUserId,
//         });
//     });

//     test("get error message and 401 status code when sending in invalid token, valid userId, valid receiverId and valid user recommendation", async () => {
//         const res = await request(app)
//             .post(`/api/users/${testUserId}/recommendations`)
//             .set({ _token: "bad token" })
//             .send({
//                 recommendation: "test recommendation?",
//                 receiverId: test2UserId,
//                 senderId: testUserId,
//             });
//         expect(res.statusCode).toBe(401);
//         expect(res.body).toEqual({
//             error: { message: "Unauthorized", status: 401 },
//         });
//     });

//     test("get error message and 403 status code when sending in valid token, invalid userId, valid receiverId and valid recommendation input", async () => {
//         const res = await request(app)
//             .post(`/api/users/1000/recommendations`)
//             .set({ _token: testUserToken })
//             .send({
//                 recommendation: "test recommendation?",
//                 receiverId: test2UserId,
//                 senderId: testUserId,
//             });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot Create Recommendations From Other Users",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 403 status code when sending in valid token, invalid userId data type, valid receiverId and valid recommendation input", async () => {
//         const res = await request(app)
//             .post(`/api/users/bad_type/recommendations`)
//             .set({ _token: testUserToken })
//             .send({
//                 recommendation: "test recommendation?",
//                 receiverId: test2UserId,
//                 senderId: testUserId,
//             });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot Create Recommendations From Other Users",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 400 status code when sending in valid token, valid userId and invalid recommendation input", async () => {
//         const res = await request(app)
//             .post(`/api/users/${testUserId}/recommendations`)
//             .set({ _token: testUserToken })
//             .send({ badInput: "nope" });
//         expect(res.statusCode).toBe(400);
//         expect(res.body).toEqual({
//             error: {
//                 message: [
//                     'instance requires property "recommendation"',
//                     'instance requires property "receiverId"',
//                     'instance requires property "senderId"',
//                 ],
//                 status: 400,
//             },
//         });
//     });
// });

// describe("PATCH /api/users/:userId", () => {
//     test("get updated user recommendation object and 200 status code when sending in valid token, valid userId, valid recommendation id and valid user recommendation input", async () => {
//         const res = await request(app)
//             .patch(`/api/users/${testUserId}/recommendations/${recId1}`)
//             .set({ _token: testUserToken })
//             .send({ recommendation: "updated recommendation" });
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({
//             id: expect.any(Number),
//             receiverId: test2UserId,
//             recommendation: "updated recommendation",
//             senderId: testUserId,
//         });
//     });

//     test("get error message and 401 status code when sending in invalid token, valid user id, valid recommendation id and valid update recommendation input", async () => {
//         const res = await request(app)
//             .patch(`/api/users/${testUserId}/recommendations/${recId1}`)
//             .set({ _token: "bad token" })
//             .send({ recommendation: "update recommendation?" });
//         expect(res.statusCode).toBe(401);
//         expect(res.body).toEqual({
//             error: { message: "Unauthorized", status: 401 },
//         });
//     });

//     test("get error message and 403 status code when sending in valid token, invalid user id, valid recommendation id and valid update recommendation input", async () => {
//         const res = await request(app)
//             .patch(`/api/users/1000/recommendations/${recId1}`)
//             .set({ _token: testUserToken })
//             .send({ recommendation: "update recommendation?" });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot Update Recommendations From Other Users",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 403 status code when sending in valid token, invalid user id data type, valid recommendation id and valid update recommendation input", async () => {
//         const res = await request(app)
//             .patch(`/api/users/bad_type/recommendations/${recId1}`)
//             .set({ _token: testUserToken })
//             .send({ recommendation: "update recommendation?" });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot Update Recommendations From Other Users",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 400 status code when sending in valid token, valid user id, valid recommendation id and invalid update recommendation input", async () => {
//         const res = await request(app)
//             .patch(`/api/users/${testUserId}/recommendations/${recId1}`)
//             .set({ _token: testUserToken })
//             .send({ recommendation: 12345 });
//         expect(res.statusCode).toBe(400);
//         expect(res.body).toEqual({
//             error: {
//                 message: ["instance.recommendation is not of a type(s) string"],
//                 status: 400,
//             },
//         });
//     });
// });

// describe("DELETE /api/users/:userId/recommendations/:recommendationId", () => {
//     test("get error message and 403 status code if valid token, other user's id and valid recommendation id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/${test2UserId}/recommendations/${recId1}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Invalid User ID",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 401 status code if invalid token, valid user id and valid recommendation id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/${testUserId}/recommendations/${recId1}`)
//             .set({ _token: "bad token" });
//         expect(res.statusCode).toBe(401);
//         expect(res.body).toEqual({
//             error: { message: "Unauthorized", status: 401 },
//         });
//     });

//     test("get error message and 403 status code if valid token, bad data type user id and valid recommendation id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/bad_type/recommendations/${recId1}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: { message: "Invalid User ID", status: 403 },
//         });
//     });

//     test("get deleted user message and 200 status code if valid token, valid user id and valid recommendation id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/${testUserId}/recommendations/${recId1}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({ msg: expect.stringContaining("Deleted") });
//     });
// });
