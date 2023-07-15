"use strict";

const db = require("../../db");

class UserRecommendation {
    constructor(id, recommendation, sender_id, receiver_id) {
        this.id = id;
        this.recommendation = recommendation;
        this.senderId = sender_id;
        this.receiverId = receiver_id;
    }

    static async getAll(userId) {
        const results = await db.query(
            `SELECT * FROM recommendations WHERE receiver_id = $1 OR sender_id = $1;`,
            [userId]
        );
        const userRecommendations = results.rows.map(
            (r) =>
                new UserRecommendation(
                    r.id,
                    r.recommendation,
                    r.sender_id,
                    r.receiver_id
                )
        );
        return userRecommendations;
    }
}

module.exports = UserRecommendation;
