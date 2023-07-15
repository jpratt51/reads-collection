"use strict";

const db = require("../db");

class UserRead {
    constructor(id, rating, reviewText, reviewDate, userId, readId) {
        this.id = id;
        this.rating = rating;
        this.reviewText = reviewText;
        this.reviewDate = reviewDate;
        this.userId = userId;
        this.readId = readId;
    }

    static async getAll(userId) {
        const results = await db.query(
            `SELECT * FROM users_reads WHERE user_id = $1;`,
            [userId]
        );
        const userReads = results.rows.map(
            (r) => new UserRead(r.id, r.rating, r.senderId, r.receiverId)
        );
        return userReads;
    }
}

module.exports = UserRead;
