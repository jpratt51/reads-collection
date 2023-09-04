"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

let testUserToken, test1Username, test2Username, isbn1, isbn2, isbn3;

beforeAll(async () => {
    await db.query("DELETE FROM users;");
    await db.query("DELETE FROM reads;");
    await db.query("DELETE FROM authors;");

    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1), ('test2', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );

    const testUser = { username: res.rows[0].username, id: res.rows[0].id };

    test1Username = res.rows[0].username;
    test2Username = res.rows[1].username;

    const isbns = await db.query(
        `INSERT INTO reads (title, description, isbn, avg_rating, print_type, published_date, page_count) VALUES ('test title', 'test description', '1243567119', 4, 'BOOK', '2023-01-01', 100), ('test title 2', 'test description 2', '1243567129', 4, 'BOOK', '2023-01-01', 250), ('test title 2', 'test description 2', '1243567139', 4, 'BOOK', '2023-01-01', 300) RETURNING isbn`
    );

    isbn1 = isbns.rows[0].isbn;
    isbn2 = isbns.rows[1].isbn;
    isbn3 = isbns.rows[2].isbn;

    await db.query(
        `INSERT INTO users_reads (rating, review_text, review_date, user_username, read_isbn) VALUES (4, 'test review', '2023-07-19', $1, $2), (3, 'test review 2', '2023-07-19', $1, $3) RETURNING id`,
        [test1Username, isbn1, isbn2]
    );

    await db.query(
        `UPDATE users SET exp = $1, total_books = $2, total_pages = $3 WHERE username = $4`,
        [350, 2, 350, test1Username]
    );

    await db.query(`INSERT INTO authors (name) VALUES ('Will Wight');`);

    await db.query(
        `INSERT INTO reads_authors (read_isbn, author_name) VALUES ('1243567119', 'Will Wight');`
    );

    testUserToken = jwt.sign(testUser, SECRET_KEY);
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.query("DELETE FROM reads;");
    await db.query("DELETE FROM authors;");
    await db.end();
});

describe("GET /api/users/:username/reads", () => {
    test("get all user reads and 200 status code with valid token and valid username.", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/reads`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                authors: "Will Wight",
                avgRating: 4,
                description: "test description",
                id: expect.any(Number),
                infoLink: null,
                isbn: "1243567119",
                pageCount: 100,
                printType: "BOOK",
                publishedDate: "2023-01-01T06:00:00.000Z",
                thumbnail: null,
                title: "test title",
                username: "test1",
            },
            {
                authors: null,
                avgRating: 4,
                description: "test description 2",
                id: expect.any(Number),
                infoLink: null,
                isbn: "1243567129",
                pageCount: 250,
                printType: "BOOK",
                publishedDate: "2023-01-01T06:00:00.000Z",
                thumbnail: null,
                title: "test title 2",
                username: "test1",
            },
        ]);
    });

    test("get all user reads with matching title and 200 status code with valid token and valid username. Does not get reads with other titles.", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/reads`)
            .set({ _token: testUserToken })
            .send({ title: "test title 2" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                authors: null,
                avgRating: 4,
                description: "test description 2",
                id: expect.any(Number),
                infoLink: null,
                isbn: "1243567129",
                pageCount: 250,
                printType: "BOOK",
                publishedDate: "2023-01-01T06:00:00.000Z",
                thumbnail: null,
                title: "test title 2",
                username: "test1",
            },
        ]);
    });

    test("get all user reads with matching author name and 200 status code with valid token and valid username. Does not get reads with different authors.", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/reads`)
            .set({ _token: testUserToken })
            .send({ author: "Will Wight" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                authors: "Will Wight",
                avgRating: 4,
                description: "test description",
                id: expect.any(Number),
                infoLink: null,
                isbn: "1243567119",
                pageCount: 100,
                printType: "BOOK",
                publishedDate: "2023-01-01T06:00:00.000Z",
                thumbnail: null,
                title: "test title",
                username: "test1",
            },
        ]);
    });

    test("Get error message and 401 status code if valid username is sent but no token.", async () => {
        const res = await request(app).get(`/api/users/${test1Username}/reads`);
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("Get error message and 401 status code if bad token is sent along with valid username.", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/reads`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("Get error message and 403 status code if valid token is sent along with another user's id.", async () => {
        const res = await request(app)
            .get(`/api/users/${test2Username}/reads`)
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

describe("GET /api/users/:username/reads/:isbn", () => {
    test("get one user read and 200 status code with valid token, valid username and valid isbn", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/reads/${isbn1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            authors: "Will Wight",
            avgRating: 4,
            description: "test description",
            id: expect.any(Number),
            infoLink: null,
            isbn: "1243567119",
            pageCount: 100,
            printType: "BOOK",
            publishedDate: "2023-01-01T06:00:00.000Z",
            rating: 4,
            reviewDate: "2023-07-19T05:00:00.000Z",
            reviewText: "test review",
            thumbnail: null,
            title: "test title",
            username: "test1",
        });
    });

    test("get error message and 401 status code with no token, a valid username and valid isbn", async () => {
        const res = await request(app).get(
            `/api/users/${test1Username}/reads/${isbn1}`
        );
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code with bad token, a valid username and valid isbn", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}/reads/${isbn1}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });
    test("get error message and 403 status code with valid token, invalid username and valid isbn", async () => {
        const res = await request(app)
            .get(`/api/users/${test2Username}/reads/${isbn2}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: {
                message: "Cannot View Other User's Reads",
                status: 403,
            },
        });
    });
    test("get error message and 403 status code with valid token, incorrect username and valid read isbn", async () => {
        const res = await request(app)
            .get(`/api/users/incorrect/reads/${isbn1}`)
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

describe("POST /api/users/:username/reads", () => {
    test("get error message and 401 status code when sending in invalid token, valid username, valid isbn and valid user reads inputs", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/reads`)
            .set({ _token: "bad token" })
            .send({
                isbn: isbn3,
                rating: 4,
                reviewText: "test",
                reviewDate: "2023-07-19",
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid username, valid isbn and valid user reads inputs", async () => {
        const res = await request(app)
            .post(`/api/users/1000/reads`)
            .set({ _token: testUserToken })
            .send({
                isbn: isbn3,
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

    test("get error message and 403 status code when sending in valid token, invalid username data type, valid isbn and valid user reads inputs", async () => {
        const res = await request(app)
            .post(`/api/users/bad_type/reads`)
            .set({ _token: testUserToken })
            .send({
                isbn: isbn3,
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

    test("get error message and 400 status code when sending in valid token, valid username, invalid isbn data type and invalid user reads inputs", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/reads`)
            .set({ _token: testUserToken })
            .send({ isbn: 1000, badInput: "nope" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: ["instance.isbn is not of a type(s) string"],
                status: 400,
            },
        });
    });

    test("get created user read object and 201 status code when sending in valid token, valid username, valid isbn and valid user read inputs", async () => {
        const res = await request(app)
            .post(`/api/users/${test1Username}/reads`)
            .set({ _token: testUserToken })
            .send({
                isbn: isbn3,
                rating: 4,
                reviewText: "test",
                reviewDate: "2023-07-19",
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            authors: null,
            avgRating: 4,
            description: "test description 2",
            id: expect.any(Number),
            infoLink: null,
            isbn: "1243567139",
            pageCount: 300,
            printType: "BOOK",
            publishedDate: "2023-01-01T06:00:00.000Z",
            rating: 4,
            reviewDate: "2023-07-19T05:00:00.000Z",
            reviewText: "test",
            thumbnail: null,
            title: "test title 2",
            username: "test1",
        });
    });

    test("expect user stats to have been updated from successful user read creation", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            email: "test@email.com",
            exp: 650,
            fname: "tfn",
            id: expect.any(Number),
            lname: "tln",
            totalBooks: 3,
            totalPages: 650,
            username: test1Username,
        });
    });
});

describe("PATCH /api/users/:username/reads/:isbn", () => {
    test("get updated user read object and 200 status code when sending in valid token, valid username, valid isbn and valid user recommendation input", async () => {
        const res = await request(app)
            .patch(`/api/users/${test1Username}/reads/${isbn1}`)
            .set({ _token: testUserToken })
            .send({
                rating: 5,
                reviewText: "text updated",
                reviewDate: "2023-07-20",
            });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            authors: "Will Wight",
            avgRating: 4,
            description: "test description",
            id: expect.any(Number),
            infoLink: null,
            isbn: "1243567119",
            pageCount: 100,
            printType: "BOOK",
            publishedDate: "2023-01-01T06:00:00.000Z",
            rating: 5,
            reviewDate: "2023-07-20T05:00:00.000Z",
            reviewText: "text updated",
            thumbnail: null,
            title: "test title",
            username: "test1",
        });
    });

    test("get error message and 401 status code when sending in invalid token, valid username, valid isbn and valid user read update inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/${test1Username}/reads/${isbn1}`)
            .set({ _token: "bad token" })
            .send({
                isbn: isbn3,
                rating: 3,
                reviewText: "test updated again?",
                reviewDate: "2023-07-18",
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code when sending in valid token, invalid username, valid isbn and valid update user read inputs", async () => {
        const res = await request(app)
            .patch(`/api/users/1000/reads/${isbn1}`)
            .set({ _token: testUserToken })
            .send({
                isbn: isbn3,
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

    test("get error message and 403 status code when sending in valid token, invalid username data type, valid recommendation id and valid update recommendation input", async () => {
        const res = await request(app)
            .patch(`/api/users/bad_type/reads/${isbn1}`)
            .set({ _token: testUserToken })
            .send({
                isbn: isbn3,
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

describe("DELETE /api/users/:username/reads/:isbn", () => {
    test("get error message and 403 status code if valid token, other user's id and valid isbn", async () => {
        const res = await request(app)
            .delete(`/api/users/${test2Username}/recommendations/${isbn1}`)
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
            .delete(`/api/users/${test1Username}/reads/${isbn1}`)
            .set({ _token: "bad token" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 403 status code if valid token, bad data type username and valid isbn", async () => {
        const res = await request(app)
            .delete(`/api/users/bad_type/reads/${isbn1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({
            error: { message: "Cannot Delete Other User's Reads", status: 403 },
        });
    });

    test("get deleted user read message and 200 status code if valid token, valid username and valid isbn", async () => {
        const res = await request(app)
            .delete(`/api/users/${test1Username}/reads/${isbn1}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ msg: expect.stringContaining("Deleted") });
    });

    test("expect user stats to have been update from successful user read deletion", async () => {
        const res = await request(app)
            .get(`/api/users/${test1Username}`)
            .set({ _token: testUserToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            email: "test@email.com",
            exp: 550,
            fname: "tfn",
            id: expect.any(Number),
            lname: "tln",
            totalBooks: 2,
            totalPages: 550,
            username: test1Username,
        });
    });
});
