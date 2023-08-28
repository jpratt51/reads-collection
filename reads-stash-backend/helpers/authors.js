"use strict";

const db = require("../db");
const { dataToSqlAuths, dataToSqlReadAuths } = require("./sql");

async function addAuthors(newReadId, readRes, authors) {
    const { placeholders, insertValues, authList } = await dataToSqlAuths(
        authors
    );

    if (insertValues.length) {
        await db.query(
            `INSERT INTO authors (name) VALUES ${placeholders} RETURNING id`,
            insertValues
        );
    }

    const { readAuthPlaceholders, readAuthValues } = await dataToSqlReadAuths(
        newReadId,
        authList
    );

    await db.query(
        `INSERT INTO reads_authors (read_id, author_id) VALUES ${readAuthPlaceholders} RETURNING *`,
        readAuthValues
    );

    const authResults = await db.query(
        `SELECT a.name FROM reads_authors ra JOIN authors a ON ra.author_id = a.id WHERE ra.read_id = $1`,
        [readRes.rows[0].id]
    );

    const readAuths = authResults.rows.map((a) => a.name);
    return readAuths;
}

module.exports = addAuthors;
