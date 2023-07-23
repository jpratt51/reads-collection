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
        followed_id,
        user_id
    ) {
        this.fname = fname;
        this.lname = lname;
        this.email = email;
        this.exp = exp;
        this.totalBooks = total_books;
        this.totalPages = total_pages;
        this.followedId = followed_id;
        this.userId = user_id;
    }

    static async getAll(userId) {
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
        const results = await db.query(
            `SELECT users.id AS followed_id, users.fname, users.lname, users.email, users.exp, users.total_books, users.total_pages, user_id FROM users_followed JOIN users ON followed_id = users.id WHERE user_id = $1;`,
            [userId]
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
                    f.followed_id,
                    f.user_id
                )
        );
        return userFollowed;
    }

    static async getById(userId, followedId) {
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
        if (/^\d+$/.test(followedId) === false)
            throw new ExpressError(`Invalid followed id data type`, 400);
        const results = await db.query(
            `SELECT users.id AS followed_id, users.fname, users.lname, users.email, users.exp, users.total_books, users.total_pages, user_id FROM users_followed JOIN users ON followed_id = users.id WHERE user_id = $1 AND followed_id = $2;`,
            [userId, followedId]
        );
        const f = results.rows[0];
        if (!f) {
            throw new ExpressError(`User followed ${followerId} not found`);
        }
        return new UserFollowed(
            f.fname,
            f.lname,
            f.email,
            f.exp,
            f.total_books,
            f.total_pages,
            f.followed_id,
            f.user_id
        );
    }

    static async create(followedId, userId) {
        const userCheck = await checkForUser(userId);
        const followedCheck = await checkForUser(followedId);
        if (userCheck) return userCheck;
        if (followedCheck) return followedCheck;

        await db.query(
            "INSERT INTO users_followed (followed_id, user_id) VALUES ($1, $2) RETURNING id ;",
            [followedId, userId]
        );

        const results = await db.query(
            "SELECT users.id AS followed_id, users.fname, users.lname, users.email, users.exp, users.total_books, users.total_pages, user_id FROM users_followed JOIN users ON followed_id = users.id WHERE user_id = $1 AND followed_id = $2;",
            [userId, followedId]
        );

        const f = results.rows[0];

        return new UserFollowed(
            f.fname,
            f.lname,
            f.email,
            f.exp,
            f.total_books,
            f.total_pages,
            f.followed_id,
            f.user_id
        );
    }

    async delete() {
        await db.query(
            "DELETE FROM users_followed WHERE followed_id = $1 AND user_id = $2;",
            [this.followedId, this.userId]
        );
    }
}

module.exports = UserFollowed;
