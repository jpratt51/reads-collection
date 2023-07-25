"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");
const { dataToSql, dataToSqlForCreate } = require("../../helpers/sql");

class UserRead {
    constructor(
        id,
        title,
        description,
        isbn,
        avg_rating,
        print_type,
        publisher,
        pages,
        rating,
        review_text,
        review_date,
        user_id,
        read_id
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.isbn = isbn;
        this.avgRating = avg_rating;
        this.printType = print_type;
        this.publisher = publisher;
        this.pages = pages;
        this.rating = rating;
        this.reviewText = review_text;
        this.reviewDate = review_date;
        this.userId = user_id;
        this.readId = read_id;
    }

    static async getAll(userId) {
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
        const results = await db.query(
            `SELECT reads.id, title, description, isbn, avg_rating, print_type, publisher, pages, rating, review_text, review_date FROM users_reads JOIN users ON users_reads.user_id = users.id JOIN reads ON users_reads.read_id = reads.id WHERE users.id = $1;`,
            [userId]
        );
        const userReads = results.rows.map(
            (r) =>
                new UserRead(
                    r.id,
                    r.title,
                    r.description,
                    r.isbn,
                    r.avg_rating,
                    r.print_type,
                    r.publisher,
                    r.pages,
                    r.rating,
                    r.review_text,
                    r.review_date,
                    r.user_id,
                    r.read_id
                )
        );
        return userReads;
    }

    static async getById(userId, readId) {
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
        if (/^\d+$/.test(readId) === false)
            throw new ExpressError(`Invalid read id data type`, 400);
        const results = await db.query(
            `SELECT users_reads.id AS id, reads.id AS read_id, title, description, isbn, avg_rating, print_type, publisher, pages, rating, review_text, review_date FROM users_reads JOIN users ON users_reads.user_id = users.id JOIN reads ON users_reads.read_id = reads.id WHERE users.id = $1 AND reads.id = $2;`,
            [userId, readId]
        );
        const r = results.rows[0];
        if (!r) {
            throw new ExpressError(`User's read ${readId} not found`, 404);
        }
        return new UserRead(
            r.id,
            r.title,
            r.description,
            r.isbn,
            r.avg_rating,
            r.print_type,
            r.publisher,
            r.pages,
            r.rating,
            r.review_text,
            r.review_date,
            r.user_id,
            r.read_id
        );
    }

    static async create(userId, readId, inputs) {
        const { rating, reviewText, reviewDate } = inputs;
        const validInputs = {};
        validInputs["user_id"] = +userId;
        validInputs["read_id"] = +readId;
        rating ? (validInputs["rating"] = rating) : null;
        reviewText ? (validInputs["review_text"] = reviewText) : null;
        reviewDate ? (validInputs["review_date"] = reviewDate) : null;

        const userReadCheck = await db.query(
            "SELECT * FROM users_reads WHERE user_id = $1 AND read_id = $2;",
            [userId, readId]
        );

        if (userReadCheck.rows[0])
            return new ExpressError("User read already exists", 400);

        const readCheck = await db.query("SELECT * FROM reads WHERE id = $1", [
            readId,
        ]);

        if (readCheck.rows[0] === undefined) {
            throw new ExpressError("Read does not exist", 400);
        }

        const { columns, values, keys } = dataToSqlForCreate(validInputs);

        await db.query(
            `INSERT INTO users_reads (${keys}) VALUES (${columns}) RETURNING *`,
            values
        );

        if (readCheck.rows[0].pages) {
            const count = +readCheck.rows[0].pages || 0;
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

        const results = await db.query(
            `SELECT users_reads.id AS id, users.id AS user_id, reads.id AS read_id, title, description, isbn, avg_rating, print_type, publisher, pages, rating, review_text, review_date FROM users_reads JOIN users ON users_reads.user_id = users.id JOIN reads ON users_reads.read_id = reads.id WHERE users.id = $1 AND reads.id = $2;`,
            [userId, readId]
        );

        const r = results.rows[0];

        return new UserRead(
            r.id,
            r.title,
            r.description,
            r.isbn,
            r.avg_rating,
            r.print_type,
            r.publisher,
            r.pages,
            r.rating,
            r.review_text,
            r.review_date,
            r.user_id,
            r.read_id
        );
    }

    static async update(userId, readId, inputs) {
        const { rating, reviewText, reviewDate } = inputs;
        const validInputs = {};
        validInputs["user_id"] = +userId;
        validInputs["read_id"] = +readId;
        rating ? (validInputs["rating"] = rating) : null;
        reviewText ? (validInputs["review_text"] = reviewText) : null;
        reviewDate ? (validInputs["review_date"] = reviewDate) : null;

        const userReadCheck = await db.query(
            "SELECT * FROM users_reads WHERE user_id = $1 AND read_id = $2;",
            [userId, readId]
        );

        if (!userReadCheck.rows[0])
            return new ExpressError("User read does not exist", 400);

        const { columns, values } = dataToSql(validInputs);

        values.push(userId);
        values.push(readId);

        const userIdIdx = values.length - 1;

        await db.query(
            `UPDATE users_reads SET ${columns} WHERE user_id = $${userIdIdx} AND read_id = $${
                userIdIdx + 1
            } RETURNING *`,
            values
        );

        const results = await db.query(
            `SELECT users_reads.id AS id, users.id AS user_id, reads.id AS read_id, title, description, isbn, avg_rating, print_type, publisher, pages, rating, review_text, review_date FROM users_reads JOIN users ON users_reads.user_id = users.id JOIN reads ON users_reads.read_id = reads.id WHERE users.id = $1 AND reads.id = $2;`,
            [userId, readId]
        );

        const r = results.rows[0];

        return new UserRead(
            r.id,
            r.title,
            r.description,
            r.isbn,
            r.avg_rating,
            r.print_type,
            r.publisher,
            r.pages,
            r.rating,
            r.review_text,
            r.review_date,
            r.user_id,
            r.read_id
        );
    }

    async delete(userId) {
        const bookBeingDeleted = await db.query(
            `SELECT r.pages FROM users_reads ur JOIN reads r ON ur.read_id = r.id WHERE ur.id = $1 AND user_id = $2`,
            [this.id, userId]
        );

        if (bookBeingDeleted.rows[0].pages) {
            let count = +bookBeingDeleted.rows[0].pages;

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
        await db.query(
            "DELETE FROM users_reads WHERE id = $1 AND user_id = $2;",
            [this.id, userId]
        );
    }
}

module.exports = UserRead;
