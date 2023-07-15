"use strict";

const db = require("../db");

class Recommendation {
    constructor(id, recommendation, senderId, receiverId) {
        this.id = id;
        this.recommendation = recommendation;
        this.sender_id = senderId;
        this.receiver_id = receiverId;
    }

    static async getAll(userId) {
        const results = await db.query(
            `SELECT * FROM recommendations WHERE receiver_id = $1 OR sender_id = $1;`,
            [userId]
        );
        const recommendations = results.rows.map(
            (r) =>
                new Recommendation(
                    r.id,
                    r.recommendation,
                    r.senderId,
                    r.receiverId
                )
        );
        return recommendations;
    }
}

module.exports = Recommendation;
