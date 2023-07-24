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
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid User ID Data Type`, 400);
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
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid User ID Data Type`, 400);
        if (/^\d+$/.test(collectionId) === false)
            throw new ExpressError(`Invalid Collection ID Data Type`, 400);
        const results = await db.query(
            `SELECT * FROM collections WHERE id = $1 AND user_id = $2;`,
            [collectionId, userId]
        );
        const c = results.rows[0];
        if (!c) {
            throw new ExpressError(
                `User's Collection ${collectionId} Not Found`
            );
        }
        return new UserCollection(c.id, c.name, c.user_id);
    }

    static async create(name, userId) {
        const duplicateCheck = await db.query(
            `SELECT * FROM collections WHERE user_id = $1 AND name = $2`,
            [userId, name]
        );

        if (duplicateCheck.rows.length !== 0)
            throw new ExpressError(
                `Collection With Name ${name} And User ID ${userId} Already Exists`,
                400
            );

        const results = await db.query(
            "INSERT INTO collections (name, user_id) VALUES ($1, $2) RETURNING * ;",
            [name, userId]
        );
        const c = results.rows[0];

        return new UserCollection(c.id, c.name, c.user_id);
    }

    async update() {
        await db.query(
            `UPDATE collections
                    SET name = $1
                    WHERE id = $2 AND user_id = $3
                    RETURNING *`,
            [this.name, this.id, this.user_id]
        );
    }

    async delete(userId) {
        await db.query(
            "DELETE FROM collections WHERE id = $1 AND user_id = $2;",
            [this.id, userId]
        );
    }
}

module.exports = UserCollection;
