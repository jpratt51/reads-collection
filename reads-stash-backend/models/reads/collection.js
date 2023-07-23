"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class ReadCollection {
    constructor(
        id,
        collection_name = null,
        collection_id,
        title = null,
        description = null,
        isbn = null,
        avg_rating = null,
        print_type = null,
        publisher = null,
        rating = null,
        review_text = null,
        review_date = null,
        read_id
    ) {
        this.id = id;
        this.collectionName = collection_name;
        this.collectionId = collection_id;
        this.title = title;
        this.description = description;
        this.isbn = isbn;
        this.avgRating = avg_rating;
        this.printType = print_type;
        this.publisher = publisher;
        this.rating = rating;
        this.reviewText = review_text;
        this.reviewDate = review_date;
        this.readId = read_id;
    }

    static async getAll(userId, readId) {
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
        const results = await db.query(
            `SELECT
                rc.id AS id,
                c.name AS collection_name,
                c.id AS collection_id
            FROM reads_collections rc
            JOIN collections c ON rc.collection_id = c.id
            WHERE c.user_id = $1 AND rc.read_id = $2;`,
            [userId, readId]
        );
        const readCollections = results.rows.map(
            (rc) =>
                new ReadCollection(rc.id, rc.collection_name, rc.collection_id)
        );
        return readCollections;
    }

    static async getById(userId, readId, collectionId) {
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
        if (/^\d+$/.test(collectionId) === false)
            throw new ExpressError(`Invalid collection id data type`, 400);
        const results = await db.query(
            `SELECT
            rc.id AS id,
            c.name AS collection_name,
            r.title,
            r.isbn,
            r.description,
            r.avg_rating,
            r.print_type,
            r.publisher,
            ur.rating,
            ur.review_text,
            ur.review_date,
            c.id AS collection_id,
            r.id AS read_id
        FROM reads_collections rc
        JOIN reads r ON rc.read_id = r.id
        JOIN users_reads ur ON ur.read_id = r.id
        JOIN collections c ON rc.collection_id = c.id
        WHERE
            c.id = $1 AND c.user_id = $2
            AND r.id = $3
            AND rc.collection_id = $1 AND rc.read_id = $3
            AND ur.user_id = $2 AND ur.read_id = $3;`,
            [collectionId, userId, readId]
        );
        const rc = results.rows[0];
        if (!rc) {
            throw new ExpressError(`User's Read Collection Not Found`);
        }
        return new ReadCollection(
            rc.id,
            rc.collection_name,
            rc.collection_id,
            rc.title,
            rc.description,
            rc.isbn,
            rc.avg_rating,
            rc.print_type,
            rc.publisher,
            rc.rating,
            rc.review_text,
            rc.review_date,
            rc.read_id
        );
    }

    static async create(inputs) {
        const readId = inputs.readId;
        const collectionId = inputs.collectionId;
        const readCheck = await db.query(`SELECT * FROM reads WHERE id = $1`, [
            readId,
        ]);
        const collectionCheck = await db.query(
            `SELECT * FROM collections WHERE id = $1`,
            [collectionId]
        );
        if (readCheck.rows.length === 0)
            throw new ExpressError("Read Not Found", 404);
        if (collectionCheck.rows.length === 0)
            throw new ExpressError("Collection Not Found", 404);
        const duplicateReadCollectionCheck = await db.query(
            "SELECT * FROM reads_collections WHERE read_id = $1 AND collection_id = $2",
            [readId, collectionId]
        );
        if (duplicateReadCollectionCheck.rows.length > 0)
            throw new ExpressError(
                "Read Collection Association Already Exists.",
                400
            );

        const results = await db.query(
            "INSERT INTO reads_collections (read_id, collection_id) VALUES ($1, $2) RETURNING *;",
            [readId, collectionId]
        );
        const rc = results.rows[0];

        return new ReadCollection(rc.id, rc.collection_id, rc.read_id);
    }

    async delete() {
        await db.query(
            "DELETE FROM reads_collections WHERE read_id = $1 AND collection_id = $2;",
            [this.readId, this.collectionId]
        );
    }
}

module.exports = ReadCollection;
