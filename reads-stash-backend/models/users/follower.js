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
        follower_id,
        user_id
    ) {
        this.fname = fname;
        this.lname = lname;
        this.email = email;
        this.exp = exp;
        this.totalBooks = total_books;
        this.totalPages = total_pages;
        this.followerId = follower_id;
        this.userId = user_id;
    }

    static async getAll(userId) {
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
        const results = await db.query(
            `SELECT users.id AS follower_id, users.fname, users.lname, users.email, users.exp, users.total_books, users.total_pages, user_id FROM users_followers JOIN users ON follower_id = users.id WHERE user_id = $1;`,
            [userId]
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
                    f.follower_id,
                    f.user_id
                )
        );
        return userFollowers;
    }

    static async getById(userId, followerId) {
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
        if (/^\d+$/.test(followerId) === false)
            throw new ExpressError(`Invalid follower id data type`, 400);
        const results = await db.query(
            `SELECT * FROM users_followers WHERE id = $1 AND user_id = $2;`,
            [followerId, userId]
        );
        const f = results.rows[0];
        if (!f) {
            throw new ExpressError(`User follower ${followerId} not found`);
        }
        return new UserFollower(f.id, f.follower_id, f.user_id);
    }
}

module.exports = UserFollower;
