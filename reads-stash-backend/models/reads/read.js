"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class Read {
    constructor(
        id,
        title,
        description,
        isbn,
        avg_rating,
        print_type,
        publisher
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.isbn = isbn;
        this.avgRating = avg_rating;
        this.printType = print_type;
        this.publisher = publisher;
    }

    static async getAll() {
        const results = await db.query("SELECT * FROM reads;");
        const reads = results.rows.map(
            (r) =>
                new Read(
                    r.id,
                    r.title,
                    r.description,
                    r.isbn,
                    r.avg_rating,
                    r.print_type,
                    r.publisher
                )
        );
        return reads;
    }

    static async getById(readId) {
        const results = await db.query(`SELECT * FROM reads WHERE id = $1;`, [
            readId,
        ]);
        const r = results.rows[0];
        if (!r) {
            throw new ExpressError(`Read ${readId} not found`);
        }
        return new Read(
            r.id,
            r.title,
            r.description,
            r.isbn,
            r.avg_rating,
            r.print_type,
            r.publisher
        );
    }

    static async create(
        thumbnail,
        title,
        description,
        isbn,
        avgRating,
        printType,
        publisher
    ) {
        const duplicateReadCheck = await db.query(
            "SELECT * FROM reads WHERE isbn = $1",
            [isbn]
        );
        if (duplicateReadCheck.rows[0])
            return { message: "Read already in database." };

        const results = await db.query(
            "INSERT INTO reads (thumbnail, title, description, isbn, average_rating, print_type, publisher) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING * ;",
            [
                thumbnail,
                title,
                description,
                isbn,
                avgRating,
                printType,
                publisher,
            ]
        );
        const r = results.rows[0];

        return new Read(
            r.id,
            r.title,
            r.description,
            r.isbn,
            r.avg_rating,
            r.print_type,
            r.publisher
        );
    }
}

module.exports = Read;
