"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");
const { dataToSqlForCreate, removeQuotes } = require("../../helpers/sql");
const addAuthors = require("../../helpers/authors");

class Read {
    constructor(
        id,
        title,
        description,
        isbn,
        avg_rating,
        print_type,
        published_date,
        thumbnail,
        info_link,
        page_count,
        authors
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.isbn = isbn;
        this.avgRating = avg_rating;
        this.printType = print_type;
        this.publishedDate = published_date;
        this.thumbnail = thumbnail;
        this.infoLink = info_link;
        this.pageCount = page_count;
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
                    r.published_date,
                    r.thumbnail,
                    r.info_link,
                    r.page_count
                )
        );
        return reads;
    }

    static async getByIsbn(isbn) {
        if (/^[0-9]+$/.test(isbn) === false)
            throw new ExpressError(`Invalid isbn data type`, 400);
        const readRes = await db.query(`SELECT * FROM reads WHERE isbn = $1;`, [
            isbn,
        ]);

        if (readRes.rows.length === 0) {
            throw new ExpressError(`Read ${isbn} not found`, 404);
        }

        const authRes = await db.query(
            `SELECT a.name FROM reads_authors ra JOIN authors a ON ra.author_name = a.name WHERE ra.read_isbn = $1`,
            [readRes.rows[0].isbn]
        );

        const readAuths = authRes.rows.map((a) => a.name);

        const r = readRes.rows[0];

        return new Read(
            r.id,
            r.title,
            r.description,
            r.isbn,
            r.avg_rating,
            r.print_type,
            r.published_date,
            r.thumbnail,
            r.info_link,
            r.page_count,
            readAuths
        );
    }

    static async create(inputs, authors) {
        removeQuotes(inputs);

        const duplicateReadCheck = await db.query(
            "SELECT * FROM reads WHERE isbn = $1",
            [inputs.isbn]
        );

        if (duplicateReadCheck.rows[0])
            return { message: "Read already in database." };

        const { values, keys } = dataToSqlForCreate(inputs);
        const readRes = await db.query(
            `INSERT INTO reads (${keys}) VALUES (${values.join(
                ", "
            )}) RETURNING *`
        );

        const newReadIsbn = readRes.rows[0].isbn;

        const r = readRes.rows[0];
        if (authors) {
            let readAuths = await addAuthors(newReadIsbn, readRes, authors);
            return new Read(
                r.id,
                r.title,
                r.description,
                r.isbn,
                r.avg_rating,
                r.print_type,
                r.published_date,
                r.thumbnail,
                r.info_link,
                r.page_count,
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
            r.published_date,
            r.thumbnail,
            r.info_link,
            r.page_count
        );
    }
}

module.exports = Read;
