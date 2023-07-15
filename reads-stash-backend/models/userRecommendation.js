"use strict";

const db = require("../db");

class UserRecommendation {
    constructor(id, recommendation, senderId, receiverId) {
        this.id = id;
        this.recommendation = recommendation;
        this.senderId = senderId;
        this.receiverId = receiverId;
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
                    r.senderId,
                    r.receiverId
                )
        );
        return userRecommendations;
    }
}

module.exports = UserRecommendation;
