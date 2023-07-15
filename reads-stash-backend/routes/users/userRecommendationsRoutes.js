"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const Recommendation = require("../../models/userRecommendation");

router.get(
    "/:userId/recommendations",
    async function getAllUserRecommendations(req, res, next) {
        try {
            const { userId } = req.params;
            let recommendations = await Recommendation.getAll(userId);
            return res.status(200).json(recommendations);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:userId/recommendations/:recommendationId",
    async function getOneUserRecommendation(req, res, next) {
        try {
            const { recommendationId, userId } = req.params;
            const results = await db.query(
                `SELECT * FROM recommendations WHERE id = $1 AND sender_id = $2 OR id = $1 AND receiver_id = $2;`,
                [recommendationId, userId]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:userId/recommendations",
    async function createUserRecommendation(req, res, next) {
        try {
            const { recommendation, receiverId, senderId } = req.body;
            const results = await db.query(
                "INSERT INTO recommendations (recommendation, receiver_id, sender_id) VALUES ($1, $2, $3) RETURNING *",
                [recommendation, receiverId, senderId]
            );
            return res.status(201).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.patch(
    "/:userId/recommendations/:recommendationId",
    async function updateUserRecommendation(req, res, next) {
        try {
            const { recommendation } = req.body;
            const { userId, recommendationId } = req.params;
            const results = await db.query(
                `UPDATE recommendations
                        SET recommendation = $1
                        WHERE id = $2 AND sender_id = $3
                        RETURNING recommendation, sender_id, receiver_id`,
                [recommendation, recommendationId, userId]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:userId/recommendations/:recommendationId",
    async function deleteUserRecommendation(req, res, next) {
        try {
            const { userId, recommendationId } = req.params;
            await db.query(
                "DELETE FROM recommendations WHERE id = $1 AND sender_id = $2 OR id = $1 AND receiver_id = $2",
                [recommendationId, userId]
            );
            return res.status(200).json({
                msg: `Deleted user recommendation ${recommendationId}`,
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
