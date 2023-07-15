"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

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

    static async getById(recommendationId, userId) {
        const results = await db.query(
            `SELECT * FROM recommendations WHERE id = $1 AND sender_id = $2 OR id = $1 AND receiver_id = $2;`,
            [recommendationId, userId]
        );
        const r = results.rows[0];
        if (!r) {
            throw new ExpressError(
                `Recommendation ${recommendationId} not found`
            );
        }
        return new UserRecommendation(
            r.id,
            r.recommendation,
            r.sender_id,
            r.receiver_id
        );
    }
}

module.exports = UserRecommendation;
