"use strict";

const db = require("../db");

class UserBadge {
    constructor(id, user_id, badge_id) {
        this.id = id;
        this.userId = user_id;
        this.badgeId = badge_id;
    }

    static async getAll(userId) {
        const results = await db.query(
            `SELECT * FROM users_badges WHERE user_id = $1;`,
            [userId]
        );
        const userBadges = results.rows.map(
            (c) => new UserBadge(c.id, c.user_id, c.badge_id)
        );
        return userBadges;
    }
}

module.exports = UserBadge;
