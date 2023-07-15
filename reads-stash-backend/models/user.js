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
        totalBooks,
        totalPages
    ) {
        this.id = id;
        this.username = username;
        this.fname = fname;
        this.lname = lname;
        this.email = email;
        this.exp = exp;
        this.totalBooks = totalBooks;
        this.totalPages = totalPages;
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
                    u.totalBooks,
                    u.totalPages
                )
        );
        return users;
    }
}

module.exports = User;
