"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class UserRead {
    constructor(id, rating, review_text, review_date, user_id, read_id) {
        this.id = id;
        this.rating = rating;
        this.reviewText = review_text;
        this.reviewDate = review_date;
        this.userId = user_id;
        this.readId = read_id;
    }

    static async getAll(userId) {
        const results = await db.query(
            `SELECT * FROM users_reads WHERE user_id = $1;`,
            [userId]
        );
        const userReads = results.rows.map(
            (r) =>
                new UserRead(
                    r.id,
                    r.rating,
                    r.review_text,
                    r.review_date,
                    r.user_id,
                    r.read_id
                )
        );
        return userReads;
    }

    static async getById(userId, usersReadsId) {
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
        if (/^\d+$/.test(usersReadsId) === false)
            throw new ExpressError(`Invalid userReads id data type`, 400);
        const results = await db.query(
            `SELECT * FROM users_reads WHERE id = $1 AND user_id = $2;`,
            [usersReadsId, userId]
        );
        const r = results.rows[0];
        if (!r) {
            throw new ExpressError(`User's read ${usersReadsId} not found`);
        }
        return new UserRead(
            r.id,
            r.rating,
            r.review_text,
            r.review_date,
            r.user_id,
            r.read_id
        );
    }

    static async create(userId, readId) {
        const readCheck = await db.query("SELECT * FROM reads WHERE id = $1", [
            readId,
        ]);

        if (!readCheck.rows[0]) return { message: "Read not found" };

        const results = await db.query(
            "INSERT INTO users_reads (user_id, read_id) VALUES ($1, $2) RETURNING id, user_id, read_id",
            [userId, readId]
        );
        const r = results.rows[0];

        return new UserRead(
            r.id,
            r.rating,
            r.review_text,
            r.review_date,
            r.user_id,
            r.read_id
        );
    }

    async delete(userId) {
        await db.query(
            "DELETE FROM users_reads WHERE id = $1 AND user_id = $2;",
            [this.id, userId]
        );
    }
}

module.exports = UserRead;
