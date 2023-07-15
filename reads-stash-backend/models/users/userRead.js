"use strict";

const db = require("../../db");

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
}

module.exports = UserRead;
