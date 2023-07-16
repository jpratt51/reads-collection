"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class User {
    constructor(
        id,
        username,
        fname,
        lname,
        email,
        exp,
        total_books,
        total_pages
    ) {
        this.id = id;
        this.username = username;
        this.fname = fname;
        this.lname = lname;
        this.email = email;
        this.exp = exp;
        this.totalBooks = total_books;
        this.totalPages = total_pages;
    }

    static async getAll() {
        const results = await db.query("SELECT * FROM users;");
        const users = results.rows.map(
            (u) =>
                new User(
                    u.id,
                    u.username,
                    u.fname,
                    u.lname,
                    u.emai,
                    u.exp,
                    u.total_books,
                    u.total_pages
                )
        );
        return users;
    }

    static async getById(userId) {
        const results = await db.query("SELECT * FROM users WHERE id = $1", [
            userId,
        ]);
        const u = results.rows[0];
        if (!u) {
            throw new ExpressError(`User ${userId} not found`);
        }
        return new User(
            u.id,
            u.username,
            u.fname,
            u.lname,
            u.email,
            u.exp,
            u.total_books,
            u.total_pages
        );
    }

    static async create(username, fname, lname, email, password) {
        const results = await db.query(
            "INSERT INTO users (username, fname, lname, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [username, fname, lname, email, password]
        );
        const u = results.rows[0];

        return new User(u.id, u.username, u.fname, u.lname, u.email);
    }

    async delete() {
        await db.query(`DELETE FROM users WHERE id = $1;`, [this.id]);
    }
}

module.exports = User;
