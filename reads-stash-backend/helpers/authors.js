"use strict";

const db = require("../db");
const { dataToSqlAuths, dataToSqlReadAuths } = require("./sql");

async function addAuthors(isbn, readRes, authors) {
    const { placeholders, insertValues, authList } = await dataToSqlAuths(
        authors
    );

    if (insertValues.length) {
        await db.query(
            `INSERT INTO authors (name) VALUES ${placeholders} RETURNING name`,
            insertValues
        );
    }

    const { readAuthPlaceholders, readAuthValues } = await dataToSqlReadAuths(
        isbn,
        authList
    );

    await db.query(
        `INSERT INTO reads_authors (read_isbn, author_name) VALUES ${readAuthPlaceholders} RETURNING *`,
        readAuthValues
    );

    const authResults = await db.query(
        `SELECT a.name FROM reads_authors ra JOIN authors a ON ra.author_name = a.name WHERE ra.read_isbn = $1`,
        [readRes.rows[0].isbn]
    );
    const readAuths = authResults.rows.map((a) => a.name);
    return readAuths;
}

module.exports = addAuthors;
