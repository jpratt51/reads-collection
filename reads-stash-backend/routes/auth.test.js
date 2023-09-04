"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

let testUserToken;

beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("secret", 1);
    const res = await db.query(
        `INSERT INTO users (username, fname, lname, email, password) VALUES ('test1', 'tfn', 'tln', 'test@email.com', $1) RETURNING username, id`,
        [hashedPassword]
    );
    const testUser = { username: res.username, id: res.id };
    testUserToken = jwt.sign(testUser, SECRET_KEY);
});

afterAll(async () => {
    await db.query("DELETE FROM users;");
    await db.end();
});

describe("POST /api/auth/register", () => {
    test("returns token and 201 status when sent valid information", async () => {
        const res = await request(app).post("/api/auth/register").send({
            username: "test2",
            fname: "t2fn",
            lname: "t2ln",
            email: "t2@email.com",
            password: "password",
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ token: expect.any(String) });
    });

    test("returns error and 400 status when missing values", async () => {
        const res = await request(app).post("/api/auth/register").send({
            username: "test3",
            password: "password",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: [
                    'instance requires property "fname"',
                    'instance requires property "lname"',
                    'instance requires property "email"',
                ],
                status: 400,
            },
        });
    });

    test("returns error and 400 status with incorrect value types", async () => {
        const res = await request(app).post("/api/auth/register").send({
            username: "test3",
            fname: "t3fn",
            lname: 187936,
            email: "t3@email.com",
            password: "password",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: ["instance.lname is not of a type(s) string"],
                status: 400,
            },
        });
    });

    test("returns error and 400 status with taken username", async () => {
        const res = await request(app).post("/api/auth/register").send({
            username: "test1",
            fname: "t1fn",
            lname: "t1ln",
            email: "t1@email.com",
            password: "password",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: "Username taken. Please pick another.",
                status: 400,
            },
        });
    });
});

describe("POST /api/auth/login", () => {
    test("returns success message, token and 200 status code with correct credentials", async () => {
        const res = await request(app).post("/api/auth/login").send({
            username: "test1",
            password: "secret",
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            message: "Successfully logged in!",
            token: expect.any(String),
        });
    });

    test("returns error and 400 status with incorrect credentials", async () => {
        const res = await request(app).post("/api/auth/login").send({
            username: "test1",
            password: "password",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: { message: "Invalid username/password", status: 400 },
        });
    });

    test("returns error and 404 status when user does not exist", async () => {
        const res = await request(app).post("/api/auth/login").send({
            username: "userDoesNotExist",
            password: "password",
        });
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            error: {
                message: "User userDoesNotExist Not Found",
                status: 404,
            },
        });
    });
});
