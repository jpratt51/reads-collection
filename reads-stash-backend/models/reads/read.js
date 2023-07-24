"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");
const {
    dataToSqlForCreate,
    dataToSqlAuths,
    dataToSqlReadAuths,
} = require("../../helpers/sql");

class Read {
    constructor(
        id,
        title,
        description,
        isbn,
        avg_rating,
        print_type,
        publisher,
        thumbnail,
        authors
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.isbn = isbn;
        this.avgRating = avg_rating;
        this.printType = print_type;
        this.publisher = publisher;
        this.thumbnail = thumbnail;
        this.authors = authors;
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
                    r.publisher,
                    r.thumbnail
                )
        );
        return reads;
    }

    static async getById(readId) {
        if (/^\d+$/.test(readId) === false)
            throw new ExpressError(`Invalid read id data type`, 400);
        const readRes = await db.query(`SELECT * FROM reads WHERE id = $1;`, [
            readId,
        ]);
        const authRes = await db.query(
            `SELECT a.name FROM reads_authors ra JOIN authors a ON ra.author_id = a.id WHERE ra.read_id = $1`,
            [readId]
        );

        const readAuths = authRes.rows.map((a) => a.name);

        const r = readRes.rows[0];
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
            r.publisher,
            r.thumbnail,
            readAuths
        );
    }

    static async create(inputs, authors) {
        const duplicateReadCheck = await db.query(
            "SELECT * FROM reads WHERE isbn = $1",
            [inputs.isbn]
        );

        if (duplicateReadCheck.rows[0])
            return { message: "Read already in database." };

        const { columns, values, keys } = dataToSqlForCreate(inputs);

        const readRes = await db.query(
            `INSERT INTO reads (${keys}) VALUES (${columns}) RETURNING * `,
            values
        );

        const newReadId = readRes.rows[0].id;

        const r = readRes.rows[0];

        if (authors) {
            const { placeholders, insertValues, authList } =
                await dataToSqlAuths(authors);

            if (insertValues.length) {
                await db.query(
                    `INSERT INTO authors (name) VALUES ${placeholders} RETURNING id`,
                    insertValues
                );
            }

            const { readAuthPlaceholders, readAuthValues } =
                await dataToSqlReadAuths(newReadId, authList);

            await db.query(
                `INSERT INTO reads_authors (read_id, author_id) VALUES ${readAuthPlaceholders} RETURNING *`,
                readAuthValues
            );

            const authResults = await db.query(
                `SELECT a.name FROM reads_authors ra JOIN authors a ON ra.author_id = a.id WHERE ra.read_id = $1`,
                [readRes.rows[0].id]
            );

            const readAuths = authResults.rows.map((a) => a.name);

            return new Read(
                r.id,
                r.title,
                r.description,
                r.isbn,
                r.avg_rating,
                r.print_type,
                r.publisher,
                r.thumbnail,
                readAuths
            );
        }

        return new Read(
            r.id,
            r.title,
            r.description,
            r.isbn,
            r.avg_rating,
            r.print_type,
            r.publisher,
            r.thumbnail
        );
    }
}

module.exports = Read;
