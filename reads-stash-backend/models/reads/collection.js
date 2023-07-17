"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class ReadCollection {
    constructor(id, read_id, collection_id) {
        this.id = id;
        this.readId = read_id;
        this.collectionId = collection_id;
    }

    static async getById(readId, collectionId) {
        const results = await db.query(
            `SELECT * FROM reads_collections WHERE read_id = $1 AND collection_id = $2;`,
            [readId, collectionId]
        );
        const c = results.rows[0];
        console.log(c);
        if (!c) {
            throw new ExpressError(`Read collection not found`);
        }
        return new ReadCollection(c.id, c.read_id, c.collection_id);
    }

    static async create(readId, collectionId) {
        const duplicateReadCollectionCheck = await db.query(
            "SELECT * FROM reads_collections WHERE read_id = $1 AND collection_id = $2",
            [readId, collectionId]
        );
        if (duplicateReadCollectionCheck.rows)
            return { message: "Read collection already exists." };

        const results = await db.query(
            "INSERT INTO reads_collections (read_id, collection_id) VALUES ($1, $2) RETURNING * ;",
            [readId, collectionId]
        );
        const c = results.rows[0];

        return new ReadCollection(c.id, c.read_id, c.collection_id);
    }

    async delete() {
        await db.query(
            "DELETE FROM reads_collections WHERE read_id = $1 AND collection_id = $2;",
            [this.readId, this.collectionId]
        );
    }
}

module.exports = ReadCollection;
