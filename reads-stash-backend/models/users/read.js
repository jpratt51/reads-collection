"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");
const { dataToSql, dataToSqlForCreate } = require("../../helpers/sql");
const {
    increaseUserStats,
    decreaseUserStats,
} = require("../../helpers/userStats");

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
        username
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
        this.username = username;
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

    static async create(username, isbn, inputs) {
        const { rating, reviewText, reviewDate } = inputs;
        const validInputs = {};
        validInputs["username"] = username;
        validInputs["isbn"] = isbn;
        rating ? (validInputs["rating"] = rating) : null;
        reviewText ? (validInputs["review_text"] = reviewText) : null;
        reviewDate ? (validInputs["review_date"] = reviewDate) : null;

        const readCheck = await db.query(
            "SELECT * FROM reads WHERE isbn = $1;",
            [isbn]
        );

        if (readCheck.rows[0] === undefined) {
            throw new ExpressError("Read does not exist", 400);
        }

        const userReadCheck = await db.query(
            "SELECT * FROM users_reads WHERE username = $1 AND isbn = $2;",
            [username, isbn]
        );

        if (userReadCheck.rows[0])
            return new ExpressError("User read already exists", 400);

        const { columns, values, keys } = dataToSqlForCreate(validInputs);

        await db.query(
            `INSERT INTO users_reads (${keys}) VALUES (${columns}) RETURNING *`,
            values
        );

        if (readCheck.rows[0].pages) {
            let pageCount = +readCheck.rows[0].pages;
            increaseUserStats(pageCount, username);
        }

        const results = await db.query(
            `SELECT ur.id AS id, r.title, r.description, u.username, ur.isbn, r.avg_rating, r.print_type, r.publisher, r.pages, ur.rating, ur.review_text, ur.review_date FROM users_reads ur JOIN users u ON ur.username = u.username JOIN reads r ON ur.isbn = r.isbn WHERE u.username = $1 AND r.isbn = $2;`,
            [username, isbn]
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
            r.username
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
            decreaseUserStats(count, userId);
        }
        await db.query(
            "DELETE FROM users_reads WHERE id = $1 AND user_id = $2;",
            [this.id, userId]
        );
    }
}

module.exports = UserRead;
