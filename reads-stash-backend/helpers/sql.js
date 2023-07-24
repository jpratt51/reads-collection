"use strict";

const db = require("../db");

function dataToSql(data) {
    const keys = Object.keys(data);
    if (keys.length === 0) return { error: "No data" };

    const columns = keys.map((name, idx) => `${name} = $${idx + 1}`);
    const values = Object.values(data);

    return {
        columns: columns.join(", "),
        values: values,
    };
}

function dataToSqlForCreate(data) {
    const keys = Object.keys(data);
    if (keys.length === 0) return { error: "No data" };

    const columns = keys.map((name, idx) => `$${idx + 1}`);
    const values = Object.values(data);

    return {
        columns: columns.join(", "),
        values: values,
        keys: keys.join(", "),
    };
}

async function dataToSqlAuths(authors) {
    const authList = authors;
    let authListForInserts = [];
    for (let a of authList) {
        const isAuthInDb = await db.query(
            `SELECT * FROM authors WHERE name = $1`,
            [a]
        );
        if (isAuthInDb.rows.length === 0) {
            authListForInserts.push(a);
        }
    }
    const placeholders = authListForInserts
        .map((name, idx) => `( $${idx + 1} )`)
        .join(", ");
    return {
        placeholders: placeholders,
        insertValues: authListForInserts,
        authList: authList,
    };
}

async function dataToSqlReadAuths(readId, authList) {
    let resourceIds = [],
        readAuthPlaceholders;
    for (const a of authList) {
        const res = await db.query(`SELECT * FROM authors WHERE name = $1`, [
            a,
        ]);
        const authId = res.rows[0].id;
        resourceIds.push(authId);
    }
    resourceIds.unshift(readId);
    readAuthPlaceholders = resourceIds.map((a, idx) => `( $1, $${idx + 2} )`);
    readAuthPlaceholders.pop();

    return {
        readAuthPlaceholders: readAuthPlaceholders.join(", "),
        readAuthValues: resourceIds,
    };
}

module.exports = {
    dataToSql,
    dataToSqlForCreate,
    dataToSqlAuths,
    dataToSqlReadAuths,
};
