"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

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
            (b) => new UserBadge(b.id, b.user_id, b.badge_id)
        );
        return userBadges;
    }

    static async getById(userId, badgeId) {
        const results = await db.query(
            "SELECT * FROM users_badges WHERE id = $1 AND user_id = $2;",
            [badgeId, userId]
        );
        const b = results.rows[0];
        if (!b) {
            throw new ExpressError(`User's badge ${badgeId} not found`);
        }
        return new UserBadge(b.id, b.user_id, b.badge_id);
    }

    static async create(userId, badgeId) {
        const userBadgeCheck = await db.query(
            "SELECT * FROM users_badges WHERE id = $1 AND user_id = $2;",
            [userId, badgeId]
        );

        if (userBadgeCheck.rows)
            return { message: "User badge already exists." };

        const results = await db.query(
            "INSERT INTO users_badges (user_id, badge_id) VALUES ($1, $2) RETURNING * ;",
            [userId, badgeId]
        );
        const b = results.rows[0];

        return new UserBadge(b.id, b.user_id, b.badge_id);
    }

    async delete(userId) {
        await db.query(
            "DELETE FROM users_badges WHERE id = $1 AND user_id = $2;",
            [this.id, userId]
        );
    }
}

module.exports = UserBadge;
