"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

let testUserToken;

let testUserId,
    test2UserId,
    test3UserId,
    testBadge1Id,
    testBadge2Id,
    testBadge3Id;

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

    const badges = await db.query(
        `INSERT INTO badges (name, thumbnail) VALUES ('bronze', 'bronze thumbnail stand in'), ('silver', 'silver thumbnail stand in'), ('gold', 'gold thumbnail stand in') RETURNING id;`
    );

    testBadge1Id = badges.rows[0].id;
    testBadge2Id = badges.rows[1].id;
    testBadge3Id = badges.rows[2].id;

    await db.query(
        `INSERT INTO users_badges (user_id, badge_id) VALUES ($1, $3), ($1, $4), ($2, $5) RETURNING id`,
        [testUserId, test2UserId, testBadge1Id, testBadge2Id, testBadge3Id]
    );

    testUserToken = jwt.sign(testUser, SECRET_KEY);
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.end();
});

describe("GET /api/users/:userId/badges", () => {
    test("get all user's badges and 200 status code with valid token and current user id. Should not get other user's badges.", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/badges`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                badgeId: testBadge1Id,
                id: expect.any(Number),
                userId: testUserId,
            },
            {
                badgeId: testBadge2Id,
                id: expect.any(Number),
                userId: testUserId,
            },
        ]);
    });

    test("get error message and 401 status code if no token sent and current user id", async () => {
        const res = await request(app).get(`/api/users/${testUserId}/badges`);
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code if bad token sent and current user id", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/badges`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token sent and other user's id", async () => {
        const res = await request(app)
            .get(`/api/users/${test2UserId}/badges`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Cannot View Other User's Badges", status: 403 },
        });
    });
});

// describe("GET /api/users/:userId/followers/:followedId", () => {
//     test("get one user badge and 200 status code with valid token, valid user id and valid user badge id", async () => {
//         const res = await request(app)
//             .get(`/api/users/${testUserId}/badges/${test2UserId}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({
//             email: "test@email.com",
//             exp: null,
//             fname: "tfn",
//             followedId: test2UserId,
//             lname: "tln",
//             totalBooks: null,
//             totalPages: null,
//             userId: testUserId,
//         });
//     });

//     test("get error message and 401 status code with no token, a valid user id and valid badges id", async () => {
//         const res = await request(app).get(
//             `/api/users/${testUserId}/badges/${test2UserId}`
//         );
//         expect(res.statusCode).toBe(401);
//         expect(res.body).toEqual({
//             error: { message: "Unauthorized", status: 401 },
//         });
//     });

//     test("get error message and 401 status code with bad token, a valid user id and valid badges id", async () => {
//         const res = await request(app)
//             .get(`/api/users/${testUserId}/badges/${test2UserId}`)
//             .set({ _token: "bad token" });
//         expect(res.statusCode).toBe(401);
//         expect(res.body).toEqual({
//             error: { message: "Unauthorized", status: 401 },
//         });
//     });

//     test("get error message and 403 status code with valid token, invalid user id and valid badge id", async () => {
//         const res = await request(app)
//             .get(`/api/users/${test2UserId}/badges/${test3UserId}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot View Other User's Followed Users",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 403 status code with valid token, invalid userId parameter type and valid badge id", async () => {
//         const res = await request(app)
//             .get(`/api/users/bad_type/badges/${testUserId}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot View Other User's Followed Users",
//                 status: 403,
//             },
//         });
//     });
// });

// describe("POST /api/users/:userId/badges", () => {
//     test("get error message and 401 status code when sending in invalid token, valid userId and valid badge id", async () => {
//         const res = await request(app)
//             .post(`/api/users/${testUserId}/badges`)
//             .set({ _token: "bad token" })
//             .send({
//                 followedId: test2UserId,
//             });
//         expect(res.statusCode).toBe(401);
//         expect(res.body).toEqual({
//             error: { message: "Unauthorized", status: 401 },
//         });
//     });

//     test("get error message and 403 status code when sending in valid token, invalid userId and valid badge id", async () => {
//         const res = await request(app)
//             .post(`/api/users/1000/badges`)
//             .set({ _token: testUserToken })
//             .send({
//                 followedId: test2UserId,
//             });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot View Other User's Followed Users",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 403 status code when sending in valid token, invalid userId data type and valid badge id", async () => {
//         const res = await request(app)
//             .post(`/api/users/bad_type/badges`)
//             .set({ _token: testUserToken })
//             .send({
//                 followedId: test2UserId,
//             });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot View Other User's Followed Users",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 400 status code when sending in valid token, valid userId and invalid badge id", async () => {
//         const res = await request(app)
//             .post(`/api/users/${testUserId}/badges`)
//             .set({ _token: testUserToken })
//             .send({ followedId: "nope" });
//         expect(res.statusCode).toBe(400);
//         expect(res.body).toEqual({
//             error: {
//                 message: ["instance.followedId is not of a type(s) integer"],
//                 status: 400,
//             },
//         });
//     });

//     test("get cbadge user and 201 status code when sending in valid token, valid userId and valid badge id", async () => {
//         const res = await request(app)
//             .post(`/api/users/${testUserId}/badges`)
//             .set({ _token: testUserToken })
//             .send({
//                 followedId: test2UserId,
//             });
//         expect(res.statusCode).toBe(201);
//         expect(res.body).toEqual({
//             email: "test@email.com",
//             exp: null,
//             fname: "tfn",
//             followedId: test2UserId,
//             lname: "tln",
//             totalBooks: null,
//             totalPages: null,
//             userId: testUserId,
//         });
//     });
// });

// describe("DELETE /api/users/:userId/badges/:badgeId", () => {
//     test("get error message and 403 status code if valid token, other user's id and valid badge id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/${test2UserId}/badges/${test3UserId}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot View Other User's Followed Users",
//                 status: 403,
//             },
//         });
//     });

//     test("get error message and 401 status code if invalid token, valid user id and valid badge id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/${testUserId}/badges/${test2UserId}`)
//             .set({ _token: "bad token" });
//         expect(res.statusCode).toBe(401);
//         expect(res.body).toEqual({
//             error: { message: "Unauthorized", status: 401 },
//         });
//     });

//     test("get error message and 403 status code if valid token, bad data type user id and valid badge id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/bad_type/badges/${test2UserId}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toEqual({
//             error: {
//                 message: "Cannot View Other User's Followed Users",
//                 status: 403,
//             },
//         });
//     });

//     test("get deleted user badge message and 200 status code if valid token, valid user id and valid badge id", async () => {
//         const res = await request(app)
//             .delete(`/api/users/${testUserId}/badges/${test2UserId}`)
//             .set({ _token: testUserToken });
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({
//             msg: expect.stringContaining("stopped following"),
//         });
//     });
// });
