"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class ReadCollection {
    constructor(
        id,
        collection_name,
        collection_id,
        isbn,
        title,
        description,
        avg_rating,
        print_type,
        published_date,
        page_count,
        info_link,
        thumbnail,
        rating,
        review_text,
        review_date
    ) {
        this.id = id;
        this.collectionName = collection_name;
        this.collectionId = collection_id;
        this.isbn = isbn;
        this.title = title;
        this.description = description;
        this.avgRating = avg_rating;
        this.printType = print_type;
        this.publishedDate = published_date;
        this.pageCount = page_count;
        this.infoLink = info_link;
        this.thumbnail = thumbnail;
        this.rating = rating;
        this.reviewText = review_text;
        this.reviewDate = review_date;
    }

    static async getAll(username, isbn) {
        const results = await db.query(
            `SELECT
                rc.read_isbn AS isbn,
                c.name AS collection_name,
                c.id AS collection_id
            FROM reads_collections rc
            JOIN collections c ON rc.collection_id = c.id
            WHERE c.user_username = $1 AND rc.read_isbn = $2;`,
            [username, isbn]
        );
        const readCollections = results.rows.map(
            (rc) =>
                new ReadCollection(
                    rc.read_isbn,
                    rc.collection_name,
                    rc.collection_id
                )
        );
        return readCollections;
    }

    static async getById(username, collectionId) {
        if (/^\d+$/.test(collectionId) === false)
            throw new ExpressError(`Invalid collection id data type`, 400);
        const results = await db.query(
            `SELECT
            rc.id,
            c.name AS collection_name,
            c.id AS collection_id,
            rc.read_isbn AS isbn,
            r.title,
            r.description,
            r.avg_rating,
            r.print_type,
            r.published_date,
            r.page_count,
            r.info_link,
            r.thumbnail,
            ur.rating,
            ur.review_text,
            ur.review_date
        FROM reads_collections rc
        JOIN reads r ON rc.read_isbn = r.isbn
        JOIN users_reads ur ON ur.read_isbn = r.isbn
        JOIN collections c ON rc.collection_id = c.id
        WHERE
            c.id = $1 AND c.user_username = $2;`,
            [collectionId, username]
        );
        const rc = results.rows[0];
        if (!rc) {
            throw new ExpressError(`User's Read Collection Not Found`);
        }
        return new ReadCollection(
            rc.id,
            rc.collection_name,
            rc.collection_id,
            rc.isbn,
            rc.title,
            rc.description,
            rc.avg_rating,
            rc.print_type,
            rc.published_date,
            rc.page_count,
            rc.info_link,
            rc.thumbnail,
            rc.rating,
            rc.review_text,
            rc.review_date
        );
    }

    static async create(inputs) {
        const isbn = inputs.isbn;
        const collectionId = inputs.collectionId;
        const readCheck = await db.query(
            `SELECT * FROM reads WHERE isbn = $1`,
            [isbn]
        );

        const collectionCheck = await db.query(
            `SELECT * FROM collections WHERE id = $1`,
            [collectionId]
        );

        if (readCheck.rows.length === 0)
            throw new ExpressError("Read Not Found", 404);
        if (collectionCheck.rows.length === 0)
            throw new ExpressError("Collection Not Found", 404);
        const duplicateReadCollectionCheck = await db.query(
            "SELECT * FROM reads_collections WHERE read_isbn = $1 AND collection_id = $2",
            [isbn, collectionId]
        );

        if (duplicateReadCollectionCheck.rows.length !== 0)
            throw new ExpressError(
                "Read Collection Association Already Exists.",
                400
            );

        await db.query(
            "INSERT INTO reads_collections (read_isbn, collection_id) VALUES ($1, $2)",
            [isbn, collectionId]
        );

        const results = await db.query(
            `SELECT rc.id, c.name AS collection_name, c.id AS collection_id, rc.read_isbn FROM reads_collections rc JOIN collections c ON rc.collection_id = c.id JOIN reads r ON rc.read_isbn = r.isbn WHERE rc.read_isbn = $1 AND rc.collection_id = $2`,
            [isbn, collectionId]
        );
        const rc = results.rows[0];

        return new ReadCollection(
            rc.id,
            rc.collection_name,
            rc.collection_id,
            rc.isbn
        );
    }

    async delete() {
        await db.query(
            "DELETE FROM reads_collections WHERE read_isbn = $1 AND collection_id = $2;",
            [this.isbn, this.collectionId]
        );
    }
}

module.exports = ReadCollection;
