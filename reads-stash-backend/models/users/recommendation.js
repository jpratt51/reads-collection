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
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
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
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
        if (/^\d+$/.test(recommendationId) === false)
            throw new ExpressError(`Invalid recommendation id data type`, 400);
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

    static async create(recommendation, receiverId, senderId) {
        const results = await db.query(
            "INSERT INTO recommendations (recommendation, receiver_id, sender_id) VALUES ($1, $2, $3) RETURNING *",
            [recommendation, receiverId, senderId]
        );
        const r = results.rows[0];

        return new UserRecommendation(
            r.id,
            r.recommendation,
            r.sender_id,
            r.receiver_id
        );
    }

    async update(userId) {
        await db.query(
            `UPDATE recommendations
                    SET recommendation = $1
                    WHERE id = $2 AND sender_id = $3
                    RETURNING recommendation, sender_id, receiver_id`,
            [this.recommendation, this.id, userId]
        );
    }

    async delete(userId) {
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
        await db.query(
            "DELETE FROM recommendations WHERE id = $1 AND sender_id = $2 OR id = $1 AND receiver_id = $2",
            [this.id, userId]
        );
    }
}

module.exports = UserRecommendation;
