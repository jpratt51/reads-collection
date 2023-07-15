"use strict";

const db = require("../db");

class Recommendation {
    constructor(id, recommendation, sender_id, receiver_id) {
        this.id = id;
        this.recommendation = recommendation;
        this.sender_id = sender_id;
        this.receiver_id = receiver_id;
    }

    static async getAll(user_id) {
        const results = await db.query(
            `SELECT * FROM recommendations WHERE receiver_id = $1 OR sender_id = $1;`,
            [user_id]
        );
        const recommendations = results.rows.map(
            (r) =>
                new Recommendation(
                    r.id,
                    r.recommendation,
                    r.sender_id,
                    r.receiver_id
                )
        );
        return recommendations;
    }
}

module.exports = Recommendation;
