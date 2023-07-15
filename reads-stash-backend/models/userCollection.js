"use strict";

const db = require("../db");

class UserCollection {
    constructor(id, name, userId) {
        this.id = id;
        this.name = name;
        this.userId = userId;
    }

    static async getAll(userId) {
        const results = await db.query(
            `SELECT * FROM collections WHERE user_id = $1;`,
            [userId]
        );
        const userCollections = results.rows.map(
            (c) => new UserCollection(c.id, c.name, c.userId)
        );
        return userCollections;
    }
}

module.exports = UserCollection;
