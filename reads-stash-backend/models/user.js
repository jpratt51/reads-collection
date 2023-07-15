"use strict";

const db = require("../db");

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
        this.total_books = total_books;
        this.total_pages = total_pages;
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
}

module.exports = User;
