"use strict";

const db = require("../db");

async function increaseUserStats(pageCount, userId) {
    const count = pageCount || 0;
    const currUserStats = await db.query(
        `SELECT exp, total_books, total_pages FROM users WHERE id = $1`,
        [userId]
    );

    let exp = +currUserStats.rows[0].exp || 0;
    let total_books = +currUserStats.rows[0].total_books || 0;
    let total_pages = +currUserStats.rows[0].total_pages || 0;
    exp += count;
    total_books += 1;
    total_pages += count;

    const userUpdate = await db.query(
        `UPDATE users SET exp = $1, total_books = $2, total_pages = $3 WHERE id = $4 RETURNING exp, total_books, total_pages`,
        [exp, total_books, total_pages, userId]
    );
}

async function decreaseUserStats(count, userId) {
    const currUserStats = await db.query(
        `SELECT exp, total_books, total_pages FROM users WHERE id = $1`,
        [userId]
    );
    let currExp = +currUserStats.rows[0].exp;
    let currTotalBooks = +currUserStats.rows[0].total_books;
    let currTotalPages = +currUserStats.rows[0].total_pages;
    currExp -= count;
    currTotalBooks -= 1;
    currTotalPages -= count;

    await db.query(
        `UPDATE users SET exp = $1, total_books = $2, total_pages = $3 WHERE id = $4`,
        [currExp, currTotalBooks, currTotalPages, userId]
    );
}

module.exports = { increaseUserStats, decreaseUserStats };
