"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

let isbn1, isbn2, isbn3, authorName1, authorName2, authorName3, testUserToken;

beforeAll(async () => {
    await db.query("DELETE FROM users;");
    await db.query("DELETE FROM reads;");

    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );

    const testUser = { username: res.rows[0].username, id: res.rows[0].id };
    testUserToken = jwt.sign(testUser, SECRET_KEY);

    const reads = await db.query(
        `INSERT INTO reads (title, description, isbn, avg_rating, print_type, published_date, page_count, thumbnail) VALUES ('t1title', 't1description', '0987654321', 3, 'BOOK', '2023-01-01', 250, 't1thumbnail'), ('t2title', 't2description', '9876543210', 3, 'BOOK', '2023-01-01', 300, 't2thumbnail') RETURNING isbn`
    );

    const read3 = await db.query(
        `INSERT INTO reads (title, isbn) VALUES ('t3title', '8765432109') RETURNING isbn`
    );

    isbn1 = reads.rows[0].isbn;
    isbn2 = reads.rows[1].isbn;
    isbn3 = read3.rows[0].isbn;

    const authors = await db.query(
        `INSERT INTO authors (name) VALUES ('t1author'), ('t2author'), ('t3author') RETURNING name`
    );

    authorName1 = authors.rows[0].name;
    authorName2 = authors.rows[1].name;
    authorName3 = authors.rows[2].name;

    await db.query(
        `INSERT INTO reads_authors (read_isbn, author_name) VALUES ($1, $3), ($1, $4), ($2, $5)`,
        [isbn1, isbn2, authorName1, authorName2, authorName3]
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
                id: expect.any(Number),
                isbn: isbn1,
                printType: "BOOK",
                publishedDate: "2023-01-01T06:00:00.000Z",
                pageCount: 250,
                infoLink: null,
                thumbnail: "t1thumbnail",
                title: "t1title",
            },
            {
                avgRating: 3,
                description: "t2description",
                id: expect.any(Number),
                isbn: isbn2,
                printType: "BOOK",
                infoLink: null,
                publishedDate: "2023-01-01T06:00:00.000Z",
                pageCount: 300,
                thumbnail: "t2thumbnail",
                title: "t2title",
            },
            {
                avgRating: null,
                description: null,
                id: expect.any(Number),
                isbn: isbn3,
                printType: null,
                publishedDate: null,
                pageCount: null,
                infoLink: null,
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

describe("GET /api/reads/:isbn", () => {
    test("get one read and 200 status code with valid isbn. No token necessary.", async () => {
        const res = await request(app).get(`/api/reads/${isbn1}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            authors: ["t1author", "t2author"],
            avgRating: 3,
            description: "t1description",
            id: expect.any(Number),
            isbn: isbn1,
            printType: "BOOK",
            infoLink: null,
            publishedDate: "2023-01-01T06:00:00.000Z",
            pageCount: 250,
            thumbnail: "t1thumbnail",
            title: "t1title",
        });
    });

    test("works for reads with missing values: empty values should be null and missing authors should be an empty array", async () => {
        const res = await request(app).get(`/api/reads/${isbn3}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            authors: [],
            avgRating: null,
            description: null,
            id: expect.any(Number),
            infoLink: null,
            isbn: isbn3,
            printType: null,
            publishedDate: null,
            pageCount: null,
            thumbnail: null,
            title: "t3title",
        });
    });

    test("get error message and 404 status with incorrect isbn", async () => {
        const res = await request(app).get(`/api/reads/10000`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            error: { message: "Read 10000 not found", status: 404 },
        });
    });

    test("get error message with bad isbn data type", async () => {
        const res = await request(app).get(`/api/reads/${true}`);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: { message: "Invalid isbn data type", status: 400 },
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
                pages: 400,
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
                pages: 400,
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
                publishedDate: { publisher: "Hidden Gnome Publishing" },
                pages: 400,
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
                    "instance.publishedDate is not of a type(s) string",
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
                publishedDate: "2023-01-01",
                pageCount: 400,
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
            infoLink: null,
            isbn: "9780989671767",
            printType: "BOOK",
            publishedDate: "2023-01-01T06:00:00.000Z",
            pageCount: 400,
            thumbnail:
                "http://books.google.com/books/content?id=OjYJtAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
            title: "Unsouled",
        });
    });
});
