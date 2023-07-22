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

// describe("POST /api/users/:userId/journals", () => {
//     test("get created user journal object and 201 status code when sending in valid token, valid userId and valid user journal inputs", async () => {
//         const res = await request(app)
//             .post(`/api/users/${testUserId}/journals`)
//             .set({ _token: testUserToken })
//             .send({
//                 title: "new journal title",
//                 date: "2023-07-17",
//                 text: "new journal text",
//             });
//         expect(res.statusCode).toBe(201);
//         expect(res.body).toEqual({
//             date: "2023-07-22T05:00:00.000Z",
//             id: expect.any(Number),
//             text: "new journal text",
//             title: "new journal title",
//             userId: testUserId,
//         });
//     });

//     test("get error message and 401 status code when sending in invalid token, valid userId and valid user recommendation", async () => {
//         const res = await request(app)
//             .post(`/api/users/${testUserId}/journals`)
//             .set({ _token: "bad token" })
//             .send({
//                 title: "new journal title 2?",
//                 date: "2023-07-18",
//                 text: "new journal text 2?",
//             });
//         expect(res.statusCode).toBe(401);
//         expect(res.body).toEqual({
//             error: { message: "Unauthorized", status: 401 },
//         });
//     });

//     test("get error message and 403 status code when sending in valid token, invalid userId and valid journal inputs", async () => {
//         const res = await request(app)
//             .post(`/api/users/1000/journals`)
//             .set({ _token: testUserToken })
//             .send({
//                 title: "new journal title 2?",
//                 date: "2023-07-18",
//                 text: "new journal text 2?",
//             });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot Create Journals For Other Users",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 403 status code when sending in valid token, invalid userId data type and valid journal inputs", async () => {
//         const res = await request(app)
//             .post(`/api/users/bad_type/journals`)
//             .set({ _token: testUserToken })
//             .send({
//                 title: "new journal title 2?",
//                 date: "2023-07-18",
//                 text: "new journal text 2?",
//             });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot Create Journals For Other Users",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 400 status code when sending in valid token, valid userId and invalid journal inputs", async () => {
//         const res = await request(app)
//             .post(`/api/users/${testUserId}/journals`)
//             .set({ _token: testUserToken })
//             .send({ badInput: "nope" });
//         expect(res.statusCode).toBe(400);
//         expect(res.body).toEqual({
//             error: {
//                 message: [
//                     'instance requires property "title"',
//                     'instance requires property "text"',
//                 ],
//                 status: 400,
//             },
//         });
//     });
// });

// describe("PATCH /api/users/:userId/journals/:journalId", () => {
//     test("get updated user journal object and 200 status code when sending in valid token, valid userId and valid user journal inputs", async () => {
//         const res = await request(app)
//             .patch(`/api/users/${testUserId}/journals/${journalId1}`)
//             .set({ _token: testUserToken })
//             .send({
//                 title: "updated journal title",
//                 date: "2023-07-18",
//                 text: "updated journal text",
//             });
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({
//             date: "2023-07-22",
//             id: journalId1,
//             text: "updated journal text",
//             title: "updated journal title",
//             userId: testUserId,
//         });
//     });

//     test("get error message and 401 status code when sending in invalid token, valid user id and valid update journal inputs", async () => {
//         const res = await request(app)
//             .patch(`/api/users/${testUserId}/journals/${journalId1}`)
//             .set({ _token: "bad token" })
//             .send({
//                 title: "updated journal title?",
//                 date: "2023-07-18",
//                 text: "updated journal text?",
//             });
//         expect(res.statusCode).toBe(401);
//         expect(res.body).toEqual({
//             error: { message: "Unauthorized", status: 401 },
//         });
//     });

//     test("get error message and 403 status code when sending in valid token, invalid user id and valid update journal inputs", async () => {
//         const res = await request(app)
//             .patch(`/api/users/1000/journals/${journalId1}`)
//             .set({ _token: testUserToken })
//             .send({
//                 title: "updated journal title?",
//                 date: "2023-07-18",
//                 text: "updated journal text?",
//             });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot Update Other User's Journals",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 403 status code when sending in valid token, invalid user id data type and valid update journal inputs", async () => {
//         const res = await request(app)
//             .patch(`/api/users/bad_type/journals/${journalId1}`)
//             .set({ _token: testUserToken })
//             .send({
//                 title: "updated journal title?",
//                 date: "2023-07-18",
//                 text: "updated journal text?",
//             });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot Update Other User's Journals",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 400 status code when sending in valid token, valid user id and invalid update journal inputs", async () => {
//         const res = await request(app)
//             .patch(`/api/users/${testUserId}/journals/${journalId1}`)
//             .set({ _token: testUserToken })
//             .send({
//                 title: 17,
//                 date: null,
//                 text: true,
//             });
//         expect(res.statusCode).toBe(400);
//         expect(res.body).toEqual({
//             error: {
//                 message: [
//                     "instance.title is not of a type(s) string",
//                     "instance.text is not of a type(s) string",
//                 ],
//                 status: 400,
//             },
//         });
//     });
// });

// describe("DELETE /api/users/:userId/journals/:journalId", () => {
//     test("get error message and 403 status code if valid token, other user's id and valid journal id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/${test2UserId}/journals/${journalId1}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot Delete Other User's Journals",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 401 status code if invalid token, valid user id and valid journal id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/${testUserId}/journals/${journalId1}`)
//             .set({ _token: "bad token" });
//         expect(res.statusCode).toBe(401);
//         expect(res.body).toEqual({
//             error: { message: "Unauthorized", status: 401 },
//         });
//     });

//     test("get error message and 403 status code if valid token, bad data type user id and valid journal id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/bad_type/journals/${journalId1}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot Delete Other User's Journals",
//                 status: 403,
//             },
//         });
//     });

//     test("get deleted user journal message and 200 status code if valid token, valid user id and valid journal id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/${testUserId}/journals/${journalId1}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({ msg: expect.stringContaining("Deleted") });
//     });
// });
