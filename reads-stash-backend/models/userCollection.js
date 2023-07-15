"use strict";

const db = require("../db");

class UserCollection {
    constructor(id, name, user_id) {
        this.id = id;
        this.title = name;
        this.user_id = user_id;
    }

    static async getAll(user_id) {
        const results = await db.query(
            `SELECT * FROM collections WHERE user_id = $1;`,
            [user_id]
        );
        const collections = results.rows.map(
            (c) => new UserCollection(c.id, c.name, c.user_id)
        );
        return collections;
    }
}

module.exports = UserCollection;
