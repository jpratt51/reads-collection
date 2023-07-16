"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class UserCollection {
    constructor(id, name, user_id) {
        this.id = id;
        this.name = name;
        this.userId = user_id;
    }

    static async getAll(userId) {
        const results = await db.query(
            `SELECT * FROM collections WHERE user_id = $1;`,
            [userId]
        );
        const userCollections = results.rows.map(
            (c) => new UserCollection(c.id, c.name, c.user_id)
        );
        return userCollections;
    }

    static async getById(userId, collectionId) {
        const results = await db.query(
            `SELECT * FROM collections WHERE id = $1 AND user_id = $2;`,
            [collectionId, userId]
        );
        const c = results.rows[0];
        if (!c) {
            throw new ExpressError(
                `User's collection ${collectionId} not found`
            );
        }
        return new UserCollection(c.id, c.name, c.user_id);
    }

    static async create(name, userId) {
        const results = await db.query(
            "INSERT INTO collections (name, user_id) VALUES ($1, $2) RETURNING * ;",
            [name, userId]
        );
        const c = results.rows[0];

        return new UserCollection(c.id, c.name, c.user_id);
    }
}

module.exports = UserCollection;
