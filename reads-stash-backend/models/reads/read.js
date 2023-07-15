"use strict";

const db = require("../../db");

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
                    r.avgRating,
                    r.printType,
                    r.publisher
                )
        );
        return reads;
    }
}

module.exports = Read;
