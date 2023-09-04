"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class UserCollection {
    constructor(id, name, user_username) {
        this.id = id;
        this.name = name;
        this.username = user_username;
    }

    static async getAll(username) {
        const results = await db.query(
            `SELECT * FROM collections WHERE user_username = $1;`,
            [username]
        );
        const userCollections = results.rows.map(
            (c) => new UserCollection(c.id, c.name, c.username)
        );
        return userCollections;
    }

    static async getById(username, collectionId) {
        if (/^\d+$/.test(collectionId) === false)
            throw new ExpressError(`Invalid Collection ID Data Type`, 400);
        const results = await db.query(
            `SELECT * FROM collections WHERE id = $1 AND user_username = $2;`,
            [collectionId, username]
        );
        const c = results.rows[0];
        if (!c) {
            throw new ExpressError(
                `User's Collection ${collectionId} Not Found`
            );
        }
        return new UserCollection(c.id, c.name, c.username);
    }

    static async create(name, username) {
        const duplicateCheck = await db.query(
            `SELECT * FROM collections WHERE user_username = $1 AND name = $2`,
            [username, name]
        );
        if (duplicateCheck.rows.length !== 0)
            throw new ExpressError(
                `Collection With Name ${name} And Username ${username} Already Exists`,
                400
            );
        const results = await db.query(
            "INSERT INTO collections (name, user_username) VALUES ($1, $2) RETURNING * ;",
            [name, username]
        );
        const c = results.rows[0];
        return new UserCollection(c.id, c.name, c.username);
    }

    async update() {
        await db.query(
            `UPDATE collections
                    SET name = $1
                    WHERE id = $2 AND user_username = $3
                    RETURNING *`,
            [this.name, this.id, this.username]
        );
    }

    async delete(username) {
        await db.query(
            "DELETE FROM collections WHERE id = $1 AND user_username = $2;",
            [this.id, username]
        );
    }
}

module.exports = UserCollection;
