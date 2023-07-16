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
}

module.exports = Read;
