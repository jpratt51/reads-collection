"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class UserRecommendation {
    constructor(id, recommendation, sender_username, receiver_username) {
        this.id = id;
        this.recommendation = recommendation;
        this.senderUsername = sender_username;
        this.receiverUsername = receiver_username;
    }

    static async getAll(username) {
        const results = await db.query(
            `SELECT * FROM recommendations WHERE receiver_username = $1 OR sender_username = $1;`,
            [username]
        );
        const userRecommendations = results.rows.map(
            (r) =>
                new UserRecommendation(
                    r.id,
                    r.recommendation,
                    r.sender_username,
                    r.receiver_username
                )
        );
        return userRecommendations;
    }

    static async getById(recommendationId, username) {
        if (/^\d+$/.test(recommendationId) === false)
            throw new ExpressError(`Invalid recommendation id data type`, 400);
        const results = await db.query(
            `SELECT * FROM recommendations WHERE id = $1 AND sender_username = $2 OR id = $1 AND receiver_username = $2;`,
            [recommendationId, username]
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
            r.sender_username,
            r.receiver_username
        );
    }

    static async create(recommendation, receiverUsername, senderUsername) {
        const results = await db.query(
            "INSERT INTO recommendations (recommendation, receiver_username, sender_username) VALUES ($1, $2, $3) RETURNING *",
            [recommendation, receiverUsername, senderUsername]
        );
        const r = results.rows[0];

        return new UserRecommendation(
            r.id,
            r.recommendation,
            r.sender_username,
            r.receiver_username
        );
    }

    async update(username) {
        await db.query(
            `UPDATE recommendations
                    SET recommendation = $1
                    WHERE id = $2 AND sender_username = $3
                    RETURNING recommendation, sender_username, receiver_username`,
            [this.recommendation, this.id, username]
        );
    }

    async delete(username) {
        await db.query(
            "DELETE FROM recommendations WHERE id = $1 AND sender_username = $2 OR id = $1 AND receiver_username = $2",
            [this.id, username]
        );
    }
}

module.exports = UserRecommendation;
