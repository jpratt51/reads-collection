"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class UserFollower {
    constructor(
        fname,
        lname,
        email,
        exp,
        total_books,
        total_pages,
        follower_username,
        username
    ) {
        this.fname = fname;
        this.lname = lname;
        this.email = email;
        this.exp = exp;
        this.totalBooks = total_books;
        this.totalPages = total_pages;
        this.followerUsername = follower_username;
        this.username = username;
    }

    static async getAll(username) {
        const results = await db.query(
            `SELECT u.fname, u.lname, u.email, u.exp, u.total_books, u.total_pages, u.username AS follower_username, uf.user_username AS username FROM users_followers uf JOIN users u ON uf.follower_username = u.username WHERE uf.user_username = $1;`,
            [username]
        );
        const userFollowers = results.rows.map(
            (f) =>
                new UserFollower(
                    f.fname,
                    f.lname,
                    f.email,
                    f.exp,
                    f.total_books,
                    f.total_pages,
                    f.follower_username,
                    f.username
                )
        );
        return userFollowers;
    }

    static async getByUsername(username, followerUsername) {
        const results = await db.query(
            `SELECT u.fname, u.lname, u.email, u.exp, u.total_books, u.total_pages, u.username AS follower_username, uf.user_username AS username FROM users_followers uf JOIN users u ON follower_username = u.username WHERE uf.user_username = $1 AND uf.follower_username = $2;`,
            [username, followerUsername]
        );
        const f = results.rows[0];
        if (!f) {
            throw new ExpressError(
                `User follower ${followerUsername} not found`
            );
        }
        return new UserFollower(
            f.fname,
            f.lname,
            f.email,
            f.exp,
            f.total_books,
            f.total_pages,
            f.follower_username,
            f.username
        );
    }
}

module.exports = UserFollower;
