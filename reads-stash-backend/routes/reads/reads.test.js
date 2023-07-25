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
    readId1,
    readId2,
    readId3,
    authorId1,
    authorId2,
    authorId3;

beforeAll(async () => {
    await db.query("DELETE FROM users;");

    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );

    const testUser = { username: res.rows[0].username, id: res.rows[0].id };
    testUserToken = jwt.sign(testUser, SECRET_KEY);

    testUserId = res.rows[0].id;

    const reads = await db.query(
        `INSERT INTO reads (title, description, isbn, avg_rating, print_type, publisher, thumbnail) VALUES ('t1title', 't1description', '0987654321', 3, 'BOOK', 'Hidden Gnome Publishing', 't1thumbnail'), ('t2title', 't2description', '9876543210', 3, 'BOOK', 'Hidden Gnome Publishing', 't2thumbnail') RETURNING id`
    );

    const read3 = await db.query(
        `INSERT INTO reads (title, isbn) VALUES ('t3title', '8765432109') RETURNING id`
    );

    readId1 = reads.rows[0].id;
    readId2 = reads.rows[1].id;
    readId3 = read3.rows[0].id;

    const authors = await db.query(
        `INSERT INTO authors (name) VALUES ('t1author'), ('t2author'), ('t3author') RETURNING id`
    );

    authorId1 = authors.rows[0].id;
    authorId2 = authors.rows[1].id;
    authorId3 = authors.rows[2].id;

    await db.query(
        `INSERT INTO reads_authors (read_id, author_id) VALUES ($1, $3), ($1, $4), ($2, $5)`,
        [readId1, readId2, authorId1, authorId2, authorId3]
    );
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.query("DELETE FROM reads;");
    await db.query("DELETE FROM authors;");
    await db.end();
});

describe("GET /api/reads", () => {
    test("get all reads and 200 status code. Missing read properties should be null. No token necessary.", async () => {
        const res = await request(app).get(`/api/reads`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            {
                avgRating: 3,
                description: "t1description",
                id: readId1,
                isbn: "0987654321",
                printType: "BOOK",
                publisher: "Hidden Gnome Publishing",
                thumbnail: "t1thumbnail",
                title: "t1title",
            },
            {
                avgRating: 3,
                description: "t2description",
                id: readId2,
                isbn: "9876543210",
                printType: "BOOK",
                publisher: "Hidden Gnome Publishing",
                thumbnail: "t2thumbnail",
                title: "t2title",
            },
            {
                avgRating: null,
                description: null,
                id: readId3,
                isbn: "8765432109",
                printType: null,
                publisher: null,
                thumbnail: null,
                title: "t3title",
            },
        ]);
    });

    test("get not found error and 404 status message with url typo", async () => {
        const res = await request(app).get(`/api/read`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            error: { message: "Page Not Found", status: 404 },
        });
    });
});

describe("GET /api/reads/:readId", () => {
    test("get one read and 200 status code with valid readId. No token necessary.", async () => {
        const res = await request(app).get(`/api/reads/${readId1}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            authors: ["t1author", "t2author"],
            avgRating: 3,
            description: "t1description",
            id: readId1,
            isbn: "0987654321",
            printType: "BOOK",
            publisher: "Hidden Gnome Publishing",
            thumbnail: "t1thumbnail",
            title: "t1title",
        });
    });

    test("works for reads with missing values: empty values should be null and missing authors should be an empty array", async () => {
        const res = await request(app).get(`/api/reads/${readId3}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            authors: [],
            avgRating: null,
            description: null,
            id: readId3,
            isbn: "8765432109",
            printType: null,
            publisher: null,
            thumbnail: null,
            title: "t3title",
        });
    });

    test("get error message and 404 status with bad read id", async () => {
        const res = await request(app).get(`/api/reads/10000`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            error: { message: "Read 10000 not found", status: 404 },
        });
    });

    test("get error message with bad read id data type", async () => {
        const res = await request(app).get(`/api/reads/${true}`);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: { message: "Invalid read id data type", status: 400 },
        });
    });
});

describe("POST /api/reads", () => {
    test("get error message and 401 status code when sending in invalid token and valid read inputs", async () => {
        const res = await request(app)
            .post(`/api/reads`)
            .set({ _token: "bad token" })
            .send({
                title: "Unsouled",
                description:
                    "Sacred artists follow a thousand Paths to power, using their souls to control the forces of the natural world. Lindon is Unsouled, forbidden to learn the sacred arts of his clan. When faced with a looming fate he cannot ignore, he must rise beyond anything he's ever known...and forge his own Path.",
                isbn: "9780989671767",
                avgRating: 4.5,
                printType: "BOOK",
                publisher: "Hidden Gnome Publishing",
                thumbnail:
                    "http://books.google.com/books/content?id=OjYJtAEACAAJ\u0026printsec=frontcover\u0026img=1\u0026zoom=1\u0026source=gbs_api",
                authors: ["Will Wight"],
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 401 status code when sending in no token and valid read inputs", async () => {
        const res = await request(app)
            .post(`/api/reads`)
            .send({
                title: "Unsouled",
                description:
                    "Sacred artists follow a thousand Paths to power, using their souls to control the forces of the natural world. Lindon is Unsouled, forbidden to learn the sacred arts of his clan. When faced with a looming fate he cannot ignore, he must rise beyond anything he's ever known...and forge his own Path.",
                isbn: "9780989671767",
                avgRating: 4.5,
                printType: "BOOK",
                publisher: "Hidden Gnome Publishing",
                thumbnail:
                    "http://books.google.com/books/content?id=OjYJtAEACAAJ\u0026printsec=frontcover\u0026img=1\u0026zoom=1\u0026source=gbs_api",
                authors: ["Will Wight"],
            });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            error: { message: "Unauthorized", status: 401 },
        });
    });

    test("get error message and 400 status code when sending in valid token and invalid read inputs", async () => {
        const res = await request(app)
            .post(`/api/reads`)
            .set({ _token: testUserToken })
            .send({
                title: 18,
                description: true,
                isbn: 8.9,
                avgRating: "happy",
                printType: [5, 6, 7],
                publisher: { publisher: "Hidden Gnome Publishing" },
                thumbnail: false,
                authors: { author: "Will Wight" },
            });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: [
                    "instance.title is not of a type(s) string",
                    "instance.description is not of a type(s) string",
                    "instance.isbn is not of a type(s) string",
                    "instance.avgRating is not of a type(s) number",
                    "instance.printType is not of a type(s) string",
                    "instance.publisher is not of a type(s) string",
                    "instance.thumbnail is not of a type(s) string",
                    "instance.authors is not of a type(s) array",
                ],
                status: 400,
            },
        });
    });

    test("get created read object and 201 status code when sending in valid token and valid read inputs", async () => {
        const res = await request(app)
            .post(`/api/reads`)
            .set({ _token: testUserToken })
            .send({
                title: "Unsouled",
                description:
                    "Sacred artists follow a thousand Paths to power, using their souls to control the forces of the natural world. Lindon is Unsouled, forbidden to learn the sacred arts of his clan. When faced with a looming fate he cannot ignore, he must rise beyond anything he's ever known...and forge his own Path.",
                isbn: "9780989671767",
                avgRating: 4.5,
                printType: "BOOK",
                publisher: "Hidden Gnome Publishing",
                thumbnail:
                    "http://books.google.com/books/content?id=OjYJtAEACAAJ\u0026printsec=frontcover\u0026img=1\u0026zoom=1\u0026source=gbs_api",
                authors: ["Will Wight"],
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            authors: ["Will Wight"],
            avgRating: 5,
            description:
                "Sacred artists follow a thousand Paths to power, using their souls to control the forces of the natural world. Lindon is Unsouled, forbidden to learn the sacred arts of his clan. When faced with a looming fate he cannot ignore, he must rise beyond anything hes ever known...and forge his own Path.",
            id: expect.any(Number),
            isbn: "9780989671767",
            printType: "BOOK",
            publisher: "Hidden Gnome Publishing",
            thumbnail:
                "http://books.google.com/books/content?id=OjYJtAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
            title: "Unsouled",
        });
    });
});
