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
    read1,
    read2,
    read3,
    read4,
    read5,
    user1collection1,
    user1collection2,
    user1collection3,
    user2collection1,
    user2collection2;

beforeAll(async () => {
    await db.query("DELETE FROM users;");
    await db.query("DELETE FROM reads;");

    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1), ('test2', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );

    const testUser = { username: res.rows[0].username, id: res.rows[0].id };
    testUserToken = jwt.sign(testUser, SECRET_KEY);

    test1Username = res.rows[0].username;
    test2Username = res.rows[1].username;

    const reads = await db.query(
        `INSERT INTO reads (title, isbn, description, avg_rating, print_type, published_date) VALUES 
        ('t1read', 1234567891011, 'test 1 book description', 3.5, 'BOOK', '2023-01-01' ),
        ('t2read', 1234567891012, 'test 2 book description', 4, 'BOOK', '2023-01-01' ),
        ('t3read', 1234567891013, 'test 3 book description', 4.5, 'BOOK', '2023-01-01' ),
        ('t4read', 1234567891014, 'test 4 book description', 5, 'BOOK', '2023-01-01' ),
        ('t5read', 1234567891015, 'test 5 book description', 2.5, 'BOOK', '2023-01-01' ) RETURNING isbn;`
    );

    read1 = reads.rows[0].isbn;
    read2 = reads.rows[1].isbn;
    read3 = reads.rows[2].isbn;
    read4 = reads.rows[3].isbn;
    read5 = reads.rows[4].isbn;

    const collections = await db.query(
        `INSERT INTO collections (name, user_username) VALUES 
        ('t1ucollection', $1),
        ('t2ucollection', $1),
        ('t3ucollection', $1),
        ('t4ucollection', $2),
        ('t5ucollection', $2)
        RETURNING id`,
        [test1Username, test2Username]
    );

    user1collection1 = collections.rows[0].id;
    user1collection2 = collections.rows[1].id;
    user1collection3 = collections.rows[2].id;
    user2collection1 = collections.rows[3].id;
    user2collection2 = collections.rows[4].id;

    await db.query(
        `INSERT INTO reads_collections (read_isbn, collection_id) VALUES
        ($1,$6),
        ($2,$7),
        ($3,$8),
        ($1,$7),
        ($4,$9),
        ($5,$10),
        ($1,$9),
        ($2,$10);`,
        [
            read1,
            read2,
            read3,
            read4,
            read5,
            user1collection1,
            user1collection2,
            user1collection3,
            user2collection1,
            user2collection2,
        ]
    );

    await db.query(
        `INSERT INTO users_reads (rating, review_text, review_date, user_username, read_isbn) VALUES
        (4, 'test 1 review text', '2023-07-22', $1, $3),
        (2, 'test 2 review text', '2023-07-22', $1, $4),
        (3, 'test 3 review text', '2023-07-22', $1, $5),
        (4, 'test 4 review text', '2023-07-22', $2, $6),
        (5, 'test 5 review text', '2023-07-22', $2, $7);`,
        [test1Username, test2Username, read1, read2, read3, read4, read5]
    );
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.query("DELETE FROM reads;");
    await db.end();
});

describe("GET /api/reads/:isbn/collections", () => {
    test("get all read collections associated with user and 200 status code when sending valid token, current username and valid isbn. Should not get read collections associated with other users.", async () => {
        const res = await request(app)
            .get(`/api/reads/${read1}/collections`)
            .set({ _token: testUserToken })
            .send({ username: test1Username });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                collectionId: user1collection1,
                collectionName: "t1ucollection",
            },
            {
                collectionId: user1collection2,
                collectionName: "t2ucollection",
            },
        ]);
    });

    test("get error message and 401 status code if no token sent with current user's username", async () => {
        const res = await request(app)
            .get(`/api/reads/${read1}/collections`)
            .send({ username: test1Username });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code if bad token sent with current user's username", async () => {
        const res = await request(app)
            .get(`/api/reads/${read1}/collections`)
            .set({ _token: "bad token" })
            .send({ username: test1Username });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token sent with other user's username", async () => {
        const res = await request(app)
            .get(`/api/reads/${read1}/collections`)
            .set({ _token: testUserToken })
            .send({ username: test2Username });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Incorrect Username",
                status: 403,
            },
        });
    });
});

describe("GET /api/reads/:isbn/collections/:collectionId", () => {
    test("get one read collection associated with a user and 200 status code with valid token, valid username, valid isbn and valid collection id", async () => {
        const res = await request(app)
            .get(`/api/reads/${read1}/collections/${user1collection1}`)
            .set({ _token: testUserToken })
            .send({ username: test1Username });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            avgRating: 4,
            collectionId: user1collection1,
            collectionName: "t1ucollection",
            description: "test 1 book description",
            id: expect.any(Number),
            isbn: read1,
            printType: "BOOK",
            pageCount: null,
            infoLink: null,
            publishedDate: "2023-01-01T06:00:00.000Z",
            rating: 4,
            reviewDate: "2023-07-22T05:00:00.000Z",
            reviewText: "test 1 review text",
            thumbnail: null,
            title: "t1read",
        });
    });

    test("get error message and 401 status code with no token, valid username, valid isbn and valid collection id", async () => {
        const res = await request(app)
            .get(`/api/reads/${read1}/collections/${user1collection1}`)
            .send({ username: test1Username });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code with bad token, valid username, valid isbn and valid collection id", async () => {
        const res = await request(app)
            .get(`/api/reads/${read1}/collections/${user1collection1}`)
            .set({ _token: "bad token" })
            .send({ username: test1Username });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code with valid token, other user's username, valid isbn and valid collection id", async () => {
        const res = await request(app)
            .get(`/api/reads/${read1}/collections/${user1collection1}`)
            .set({ _token: testUserToken })
            .send({ username: test2Username });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Incorrect Username",
                status: 403,
            },
        });
    });

    test("get error message and 401 status code with invalid token, valid username parameter type, valid isbn and valid collection id", async () => {
        const res = await request(app)
            .get(`/api/reads/${read1}/collections/${user1collection1}`)
            .set({ _token: "bad type" })
            .send({ username: test1Username });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: {
                message: "Unauthorized",
                status: 401,
            },
        });
    });
});

describe("POST /api/reads/:isbn/collections", () => {
    test("get error message and 401 status code when sending in invalid token, valid username, valid isbn and valid collection id", async () => {
        const res = await request(app)
            .post(`/api/reads/${read1}/collections`)
            .set({ _token: "bad token" })
            .send({
                username: test1Username,
                collectionId: user1collection3,
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid username, valid isbn and valid collection id", async () => {
        const res = await request(app)
            .post(`/api/reads/${read1}/collections`)
            .set({ _token: testUserToken })
            .send({
                username: test2Username,
                collectionId: user1collection3,
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Incorrect Username",
                status: 403,
            },
        });
    });

    test("get error message and 403 status code when sending in valid token, incorrect username, valid isbn and valid collection id", async () => {
        const res = await request(app)
            .post(`/api/reads/${read1}/collections`)
            .set({ _token: testUserToken })
            .send({
                username: "bad type",
                collectionId: user1collection3,
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Incorrect Username",
                status: 403,
            },
        });
    });

    test("get error message and 400 status code when sending in valid token, valid username, isbn and collection id for an existing read collection", async () => {
        const res = await request(app)
            .post(`/api/reads/${read1}/collections`)
            .set({ _token: testUserToken })
            .send({ username: test1Username, collectionId: user1collection1 });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: "Read Collection Association Already Exists.",
                status: 400,
            },
        });
    });

    test("get created read collection object and 201 status code when sending in valid token, valid username, valid isbn and valid collection id", async () => {
        const res = await request(app)
            .post(`/api/reads/${read1}/collections`)
            .set({ _token: testUserToken })
            .send({
                username: test1Username,
                collectionId: user1collection3,
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            id: expect.any(Number),
            collectionId: user1collection3,
            collectionName: "t3ucollection",
        });
    });
});

describe("DELETE /api/reads/:readId/collections/:collectionId", () => {
    test("get error message and 403 status code if valid token, other user's username, valid isbn and valid collection id", async () => {
        const res = await request(app)
            .delete(`/api/reads/${read1}/collections/${user1collection1}`)
            .set({ _token: testUserToken })
            .send({
                username: test2Username,
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Incorrect Username",
                status: 403,
            },
        });
    });

    test("get error message and 401 status code if invalid token, valid username, valid isbn and valid collection id", async () => {
        const res = await request(app)
            .delete(`/api/reads/${read1}/collections/${user1collection1}`)
            .set({ _token: "bad token" })
            .send({
                username: test1Username,
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token, incorrect username, valid read id and valid collection id", async () => {
        const res = await request(app)
            .delete(`/api/reads/${read1}/collections/${user1collection1}`)
            .set({ _token: testUserToken })
            .send({
                username: "12345",
            });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Incorrect Username",
                status: 403,
            },
        });
    });

    test("get deleted user's read collection message and 200 status code if valid token, valid username, valid isbn and valid collection id", async () => {
        const res = await request(app)
            .delete(`/api/reads/${read1}/collections/${user1collection1}`)
            .set({ _token: testUserToken })
            .send({
                username: test1Username,
            });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            msg: `Deleted Read ${read1} Association With Collection ${user1collection1}`,
        });
    });
});
