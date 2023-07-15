"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class UserFollower {
    constructor(id, follower_id, user_id) {
        this.id = id;
        this.followerId = follower_id;
        this.userId = user_id;
    }

    static async getAll(userId) {
        const results = await db.query(
            `SELECT * FROM users_followers WHERE user_id = $1;`,
            [userId]
        );
        const userFollowers = results.rows.map(
            (f) => new UserFollower(f.id, f.follower_id, f.user_id)
        );
        return userFollowers;
    }

    static async getById(userId, followerId) {
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
