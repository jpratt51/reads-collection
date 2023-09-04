"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");
const { checkForUser } = require("../../helpers/checkUser");

class UserFollowed {
    constructor(
        fname,
        lname,
        email,
        exp,
        total_books,
        total_pages,
        followed_username,
        username
    ) {
        this.fname = fname;
        this.lname = lname;
        this.email = email;
        this.exp = exp;
        this.totalBooks = total_books;
        this.totalPages = total_pages;
        this.followedUsername = followed_username;
        this.username = username;
    }

    static async getAll(username) {
        const results = await db.query(
            `SELECT u.username AS followed_username, u.fname, u.lname, u.email, u.exp, u.total_books, u.total_pages, user_username FROM users_followed uf JOIN users u ON followed_username = u.username WHERE user_username = $1;`,
            [username]
        );
        const userFollowed = results.rows.map(
            (f) =>
                new UserFollowed(
                    f.fname,
                    f.lname,
                    f.email,
                    f.exp,
                    f.total_books,
                    f.total_pages,
                    f.followed_username,
                    f.username
                )
        );
        return userFollowed;
    }

    static async getByUsername(username, followedUsername) {
        const results = await db.query(
            `SELECT u.fname, u.lname, u.email, u.exp, u.total_books, u.total_pages, uf.followed_username, uf.user_username AS username FROM users_followed uf JOIN users u ON followed_username = u.username WHERE user_username = $1 AND followed_username = $2;`,
            [username, followedUsername]
        );
        const f = results.rows[0];
        if (!f) {
            throw new ExpressError(
                `User followed ${followedUsername} not found`
            );
        }
        return new UserFollowed(
            f.fname,
            f.lname,
            f.email,
            f.exp,
            f.total_books,
            f.total_pages,
            f.followed_username,
            f.username
        );
    }

    static async create(followedUsername, username) {
        const userCheck = await checkForUser(username);
        const followedCheck = await checkForUser(followedUsername);
        if (userCheck) return userCheck;
        if (followedCheck) return followedCheck;
        await db.query(
            "INSERT INTO users_followed (followed_username, user_username) VALUES ($1, $2)",
            [followedUsername, username]
        );
        const results = await db.query(
            "SELECT u.fname, u.lname, u.email, u.exp, u.total_books, u.total_pages, u.username AS followed_username, uf.user_username AS username FROM users_followed uf JOIN users u ON followed_username = u.username WHERE user_username = $1 AND followed_username = $2;",
            [username, followedUsername]
        );

        const f = results.rows[0];
        return new UserFollowed(
            f.fname,
            f.lname,
            f.email,
            f.exp,
            f.total_books,
            f.total_pages,
            f.followed_username,
            f.username
        );
    }

    async delete() {
        await db.query(
            "DELETE FROM users_followed WHERE followed_username = $1 AND user_username = $2;",
            [this.followedUsername, this.username]
        );
    }
}

module.exports = UserFollowed;
