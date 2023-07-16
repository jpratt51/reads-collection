"use strict";

const db = require("../../db");

class ReadCollection {
    constructor(id, read_id, collection_id) {
        this.id = id;
        this.readId = read_id;
        this.collectionId = collection_id;
    }

    static async create(readId, collectionId) {
        const results = await db.query(
            "INSERT INTO reads_collections (read_id, collection_id) VALUES ($1, $2) RETURNING * ;",
            [readId, collectionId]
        );
        const c = results.rows[0];

        return new ReadCollection(c.id, c.read_id, c.collection_id);
    }
}

module.exports = ReadCollection;
