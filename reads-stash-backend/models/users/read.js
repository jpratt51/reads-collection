"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");
const { dataToSql, dataToSqlForCreateUserRead } = require("../../helpers/sql");
const {
    increaseUserStats,
    decreaseUserStats,
} = require("../../helpers/userStats");

const getOneUserReadQuery = `SELECT ur.id, r.title, r.description, r.isbn, r.avg_rating, r.print_type, r.published_date, r.page_count, r.info_link, r.thumbnail, ur.rating, ur.review_text, ur.review_date, ur.user_username AS username, ra.author_name AS author FROM users_reads ur JOIN users u ON ur.user_username = u.username JOIN reads r ON ur.read_isbn = r.isbn LEFT JOIN reads_authors ra ON ra.read_isbn = r.isbn WHERE u.username = $1 AND r.isbn = $2;`;

class UserRead {
    constructor(
        id,
        title,
        description,
        isbn,
        avg_rating,
        print_type,
        published_date,
        page_count,
        info_link,
        thumbnail,
        rating,
        review_text,
        review_date,
        username,
        authors
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.isbn = isbn;
        this.avgRating = avg_rating;
        this.printType = print_type;
        this.publishedDate = published_date;
        this.pageCount = page_count;
        this.infoLink = info_link;
        this.thumbnail = thumbnail;
        this.rating = rating;
        this.reviewText = review_text;
        this.reviewDate = review_date;
        this.username = username;
        this.authors = authors;
    }

    static async getAll(username, title, author) {
        console.log("*****1", username, title, author);
        let queryString = `SELECT ur.id, r.title, r.description, r.isbn, r.avg_rating, r.print_type, r.published_date, r.page_count, r.info_link, r.thumbnail, ur.user_username AS username, ra.author_name AS author FROM users_reads ur JOIN users u ON ur.user_username = u.username JOIN reads r ON ur.read_isbn = r.isbn LEFT JOIN reads_authors ra ON ra.read_isbn = r.isbn WHERE u.username = $1`;
        let values = [username];
        let results;
        console.log("*****2", queryString, values);
        if (title || author) {
            if (title && author) {
                queryString += " AND r.title = $2 AND ra.author_name = $3;";
                values.push(title);
                values.push(author);
            } else if (title && !author) {
                queryString += " AND r.title = $2;";
                values.push(title);
            } else {
                queryString += " AND ra.author_name = $2;";
                values.push(author);
            }
            console.log("*****3", queryString, values);
            results = await db.query(queryString, values);
        } else {
            console.log("*****4", queryString, values);
            results = await db.query(queryString + ";", values);
        }
        console.log("*****5", results.rows);
        const userReads = results.rows.map(
            (r) =>
                new UserRead(
                    r.id,
                    r.title,
                    r.description,
                    r.isbn,
                    r.avg_rating,
                    r.print_type,
                    r.published_date,
                    r.page_count,
                    r.info_link,
                    r.thumbnail,
                    r.rating,
                    r.review_text,
                    r.review_date,
                    r.username,
                    r.author
                )
        );
        return userReads;
    }

    static async getByIsbn(username, isbn) {
        if (/^[0-9]+$/.test(isbn) === false)
            throw new ExpressError(`Invalid ISBN Data Type`, 400);
        const results = await db.query(getOneUserReadQuery, [username, isbn]);
        const ur = results.rows[0];
        if (!ur) {
            throw new ExpressError(`User's Read ${isbn} Not Found`, 404);
        }
        return new UserRead(
            ur.id,
            ur.title,
            ur.description,
            ur.isbn,
            ur.avg_rating,
            ur.print_type,
            ur.published_date,
            ur.page_count,
            ur.info_link,
            ur.thumbnail,
            ur.rating,
            ur.review_text,
            ur.review_date,
            ur.username,
            ur.author
        );
    }

    static async create(username, isbn, inputs) {
        const { rating, reviewText, reviewDate } = inputs;
        const validInputs = {};
        validInputs["user_username"] = username;
        validInputs["read_isbn"] = isbn;
        rating ? (validInputs["rating"] = rating) : null;
        reviewText ? (validInputs["review_text"] = reviewText) : null;
        reviewDate ? (validInputs["review_date"] = reviewDate) : null;

        const readCheck = await db.query(
            "SELECT * FROM reads WHERE isbn = $1;",
            [isbn]
        );

        if (readCheck.rows[0] === undefined) {
            throw new ExpressError("Read Does Not Exist", 400);
        }

        const userReadCheck = await db.query(
            "SELECT * FROM users_reads WHERE user_username = $1 AND read_isbn = $2;",
            [username, isbn]
        );
        if (userReadCheck.rows[0])
            return new ExpressError("User Read Already Exists", 400);

        const { columns, values, keys } =
            dataToSqlForCreateUserRead(validInputs);

        await db.query(
            `INSERT INTO users_reads (${keys}) VALUES (${columns}) RETURNING *`,
            values
        );
        if (readCheck.rows[0].page_count) {
            let pageCount = +readCheck.rows[0].page_count;
            increaseUserStats(pageCount, username);
        }

        const results = await db.query(getOneUserReadQuery, [username, isbn]);
        const ur = results.rows[0];

        return new UserRead(
            ur.id,
            ur.title,
            ur.description,
            ur.isbn,
            ur.avg_rating,
            ur.print_type,
            ur.published_date,
            ur.page_count,
            ur.info_link,
            ur.thumbnail,
            ur.rating,
            ur.review_text,
            ur.review_date,
            ur.username,
            ur.author
        );
    }

    static async update(username, isbn, inputs) {
        const { rating, reviewText, reviewDate } = inputs;
        const validInputs = {};
        validInputs["user_username"] = username;
        validInputs["read_isbn"] = isbn;
        rating ? (validInputs["rating"] = rating) : null;
        reviewText ? (validInputs["review_text"] = reviewText) : null;
        reviewDate ? (validInputs["review_date"] = reviewDate) : null;
        console.log("*****6", validInputs);
        const userReadCheck = await db.query(
            "SELECT * FROM users_reads WHERE user_username = $1 AND read_isbn = $2;",
            [username, isbn]
        );

        if (!userReadCheck.rows[0])
            return new ExpressError("User Read Does Not Exist", 400);

        const { columns, values } = dataToSql(validInputs);

        values.push(username);
        values.push(isbn);

        const usernameIdx = values.length - 1;

        await db.query(
            `UPDATE users_reads SET ${columns} WHERE user_username = $${usernameIdx} AND read_isbn = $${
                usernameIdx + 1
            } RETURNING *`,
            values
        );

        const results = await db.query(getOneUserReadQuery, [username, isbn]);

        const ur = results.rows[0];

        return new UserRead(
            ur.id,
            ur.title,
            ur.description,
            ur.isbn,
            ur.avg_rating,
            ur.print_type,
            ur.published_date,
            ur.page_count,
            ur.info_link,
            ur.thumbnail,
            ur.rating,
            ur.review_text,
            ur.review_date,
            ur.username,
            ur.author
        );
    }

    async delete(username) {
        const bookBeingDeleted = await db.query(
            `SELECT r.page_count FROM users_reads ur JOIN reads r ON ur.read_isbn = r.isbn WHERE ur.read_isbn = $1 AND ur.user_username = $2`,
            [this.isbn, username]
        );

        if (bookBeingDeleted.rows[0].page_count) {
            let count = +bookBeingDeleted.rows[0].page_count;
            decreaseUserStats(count, username);
        }
        await db.query(
            "DELETE FROM users_reads WHERE read_isbn = $1 AND user_username = $2;",
            [this.isbn, username]
        );
    }
}

module.exports = UserRead;
