"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class UserFollowed {
    constructor(id, followed_id, user_id) {
        this.id = id;
        this.followedId = followed_id;
        this.userId = user_id;
    }

    static async getAll(userId) {
        const results = await db.query(
            `SELECT * FROM users_followed WHERE user_id = $1;`,
            [userId]
        );
        const userFollowed = results.rows.map(
            (f) => new UserFollowed(f.id, f.followed_id, f.user_id)
        );
        return userFollowed;
    }

    static async getById(userId, followedId) {
        const results = await db.query(
            `SELECT * FROM users_followed WHERE id = $1 AND user_id = $2;`,
            [followedId, userId]
        );
        const f = results.rows[0];
        if (!f) {
            throw new ExpressError(`User followed ${followerId} not found`);
        }
        return new UserFollowed(f.id, f.followed_id, f.user_id);
    }
}

module.exports = UserFollowed;
