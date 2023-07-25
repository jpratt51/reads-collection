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
    readId3,
    userReadId1,
    userReadId2;

beforeAll(async () => {
    await db.query("DELETE FROM users;");
    await db.query("DELETE FROM reads;");

    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1), ('test2', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );

    const testUser = { username: res.rows[0].username, id: res.rows[0].id };

    testUserId = res.rows[0].id;
    test2UserId = res.rows[1].id;

    const readIds = await db.query(
        `INSERT INTO reads (title, description, isbn, avg_rating, print_type, publisher, pages) VALUES ('test title', 'test description', '1243567119', 4, 'BOOK', 'test publisher', 100), ('test title 2', 'test description 2', '1243567129', 4, 'BOOK', 'test publisher 2', 250), ('test title 2', 'test description 2', '1243567139', 4, 'BOOK', 'test publisher 2', 300) RETURNING id`
    );

    readId1 = readIds.rows[0].id;
    readId2 = readIds.rows[1].id;
    readId3 = readIds.rows[2].id;

    const userReadIds = await db.query(
        `INSERT INTO users_reads (rating, review_text, review_date, user_id, read_id) VALUES (4, 'test review', '2023-07-19', $1, $2), (3, 'test review 2', '2023-07-19', $1, $3) RETURNING id`,
        [testUserId, readId1, readId2]
    );

    await db.query(
        `UPDATE users SET exp = $1, total_books = $2, total_pages = $3 WHERE id = $4`,
        [350, 2, 350, testUserId]
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
                avgRating: 4,
                description: "test description",
                id: readId1,
                isbn: "1243567119",
                printType: "BOOK",
                publisher: "test publisher",
                pages: 100,
                rating: 4,
                reviewDate: "2023-07-19T05:00:00.000Z",
                reviewText: "test review",
                title: "test title",
            },
            {
                avgRating: 4,
                description: "test description 2",
                id: readId2,
                isbn: "1243567129",
                printType: "BOOK",
                publisher: "test publisher 2",
                pages: 250,
                rating: 3,
                reviewDate: "2023-07-19T05:00:00.000Z",
                reviewText: "test review 2",
                title: "test title 2",
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

describe("GET /api/users/:userId/reads/:readId", () => {
    test("get one user read and 200 status code with valid token, valid user id and valid read id", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/reads/${readId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            avgRating: 4,
            description: "test description",
            id: expect.any(Number),
            isbn: "1243567119",
            printType: "BOOK",
            publisher: "test publisher",
            pages: 100,
            rating: 4,
            readId: expect.any(Number),
            reviewDate: "2023-07-19T05:00:00.000Z",
            reviewText: "test review",
            title: "test title",
        });
    });

    test("get error message and 401 status code with no token, a valid user id and valid read id", async () => {
        const res = await request(app).get(
            `/api/users/${testUserId}/reads/${readId1}`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code with bad token, a valid user id and valid read id", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}/reads/${readId1}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });
    test("get error message and 403 status code with valid token, invalid user id and valid read id", async () => {
        const res = await request(app)
            .get(`/api/users/${test2UserId}/reads/${readId2}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Reads",
                status: 403,
            },
        });
    });
    test("get error message and 403 status code with valid token, invalid userId parameter type and valid read id", async () => {
        const res = await request(app)
            .get(`/api/users/bad_type/reads/${readId1}`)
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

describe("POST /api/users/:userId/reads", () => {
    test("get error message and 401 status code when sending in invalid token, valid userId, valid readId and valid user reads inputs", async () => {
        const res = await request(app)
            .post(`/api/users/${testUserId}/reads`)
            .set({ _token: "bad token" })
            .send({
                readId: readId3,
                rating: 4,
                reviewText: "test",
                reviewDate: "2023-07-19",
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid userId, valid readId and valid user reads inputs", async () => {
        const res = await request(app)
            .post(`/api/users/1000/reads`)
            .set({ _token: testUserToken })
            .send({
                readId: readId3,
                rating: 4,
                reviewText: "test",
                reviewDate: "2023-07-19",
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot Create Reads For Other Users",
                status: 403,
            },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid userId data type, valid readId and valid user reads inputs", async () => {
        const res = await request(app)
            .post(`/api/users/bad_type/reads`)
            .set({ _token: testUserToken })
            .send({
                readId: readId3,
                rating: 4,
                reviewText: "test",
                reviewDate: "2023-07-19",
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot Create Reads For Other Users",
                status: 403,
            },
        });
    });

    test("get error message and 400 status code when sending in valid token, valid userId, invalid readId and invalid user reads inputs", async () => {
        const res = await request(app)
            .post(`/api/users/${testUserId}/reads`)
            .set({ _token: testUserToken })
            .send({ readId: 1000, badInput: "nope" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: { message: "Read does not exist", status: 400 },
        });
    });

    test("get created user read object and 201 status code when sending in valid token, valid userId, valid readId and valid user read inputs", async () => {
        const res = await request(app)
            .post(`/api/users/${testUserId}/reads`)
            .set({ _token: testUserToken })
            .send({
                readId: readId3,
                rating: 4,
                reviewText: "test",
                reviewDate: "2023-07-19",
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            avgRating: 4,
            description: "test description 2",
            id: expect.any(Number),
            isbn: "1243567139",
            printType: "BOOK",
            publisher: "test publisher 2",
            pages: 300,
            rating: 4,
            readId: readId3,
            reviewDate: "2023-07-19T05:00:00.000Z",
            reviewText: "'test'",
            title: "test title 2",
            userId: testUserId,
        });
    });

    test("expect user stats to have been update from successful user read creation", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            email: "test@email.com",
            exp: 650,
            fname: "tfn",
            id: testUserId,
            lname: "tln",
            totalBooks: 3,
            totalPages: 650,
            username: "test1",
        });
    });
});

describe("PATCH /api/users/:userId/reads/:readId", () => {
    test("get updated user read object and 200 status code when sending in valid token, valid userId, valid readId and valid user recommendation input", async () => {
        const res = await request(app)
            .patch(`/api/users/${testUserId}/reads/${readId1}`)
            .set({ _token: testUserToken })
            .send({
                readId: readId3,
                rating: 5,
                reviewText: "test updated",
                reviewDate: "2023-07-20",
            });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            avgRating: 4,
            description: "test description",
            id: expect.any(Number),
            isbn: "1243567119",
            printType: "BOOK",
            publisher: "test publisher",
            pages: 100,
            rating: 5,
            readId: readId1,
            reviewDate: "2023-07-20T05:00:00.000Z",
            reviewText: "test updated",
            title: "test title",
            userId: testUserId,
        });
    });

    test("get error message and 401 status code when sending in invalid token, valid user id, valid read id and valid user read update inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/${testUserId}/reads/${readId1}`)
            .set({ _token: "bad token" })
            .send({
                readId: readId3,
                rating: 3,
                reviewText: "test updated again?",
                reviewDate: "2023-07-18",
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid user id, valid read id and valid update user read inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/1000/reads/${readId1}`)
            .set({ _token: testUserToken })
            .send({
                readId: readId3,
                rating: 3,
                reviewText: "test updated again?",
                reviewDate: "2023-07-18",
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot Update Reads For Other Users",
                status: 403,
            },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid user id data type, valid recommendation id and valid update recommendation input", async () => {
        const res = await request(app)
            .patch(`/api/users/bad_type/reads/${readId1}`)
            .set({ _token: testUserToken })
            .send({
                readId: readId3,
                rating: 3,
                reviewText: "test updated again?",
                reviewDate: "2023-07-18",
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot Update Reads For Other Users",
                status: 403,
            },
        });
    });
});

describe("DELETE /api/users/:userId/reads/:readId", () => {
    test("get error message and 403 status code if valid token, other user's id and valid read id", async () => {
        const res = await request(app)
            .delete(`/api/users/${test2UserId}/recommendations/${readId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Invalid User ID",
                status: 403,
            },
        });
    });

    test("get error message and 401 status code if invalid token, valid user id and valid recommendation id", async () => {
        const res = await request(app)
            .delete(`/api/users/${testUserId}/reads/${readId1}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token, bad data type user id and valid read id", async () => {
        const res = await request(app)
            .delete(`/api/users/bad_type/reads/${readId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Cannot Delete Other User's Reads", status: 403 },
        });
    });

    test("get deleted user read message and 200 status code if valid token, valid user id and valid read id", async () => {
        const res = await request(app)
            .delete(`/api/users/${testUserId}/reads/${readId1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ msg: expect.stringContaining("Deleted") });
    });

    test("expect user stats to have been update from successful user read deletion", async () => {
        const res = await request(app)
            .get(`/api/users/${testUserId}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            email: "test@email.com",
            exp: 550,
            fname: "tfn",
            id: testUserId,
            lname: "tln",
            totalBooks: 2,
            totalPages: 550,
            username: "test1",
        });
    });
});
