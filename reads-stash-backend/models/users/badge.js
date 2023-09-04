"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class UserBadge {
    constructor(id, user_username, name) {
        this.id = id;
        this.username = user_username;
        this.name = name;
    }

    static async getAll(username) {
        const results = await db.query(
            `SELECT * FROM users_badges WHERE user_username = $1;`,
            [username]
        );
        const userBadges = results.rows.map(
            (b) => new UserBadge(b.id, b.user_username, b.name)
        );
        return userBadges;
    }

    static async getByName(username, name) {
        const results = await db.query(
            "SELECT * FROM users_badges WHERE user_username = $1 AND name = $2;",
            [username, name]
        );
        const b = results.rows[0];

        if (!b) {
            throw new ExpressError(`User's Badge ${name} Not Found`);
        }
        return new UserBadge(b.id, b.user_username, b.name);
    }

    static async create(username, name) {
        const userBadgeCheck = await db.query(
            "SELECT * FROM users_badges WHERE name = $1 AND user_username = $2;",
            [name, username]
        );

        if (userBadgeCheck.rows.length)
            return { message: "User Badge Already Exists." };

        const results = await db.query(
            "INSERT INTO users_badges (user_username, name) VALUES ($1, $2) RETURNING * ;",
            [username, name]
        );
        const b = results.rows[0];

        return new UserBadge(b.id, b.user_username, b.name);
    }

    async delete(username) {
        await db.query(
            "DELETE FROM users_badges WHERE name = $1 AND user_username = $2;",
            [this.name, username]
        );
    }
}

module.exports = UserBadge;
