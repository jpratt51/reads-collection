"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserRecommendation = require("../../models/users/recommendation");

router.get(
    "/:userId/recommendations",
    async function getAllUserRecommendations(req, res, next) {
        try {
            const { userId } = req.params;
            let recommendations = await UserRecommendation.getAll(userId);
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
            let recommendation = await UserRecommendation.getById(
                recommendationId,
                userId
            );
            return res.status(200).json(recommendation);
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
            const newRecommendation = await UserRecommendation.create(
                recommendation,
                receiverId,
                senderId
            );
            return res.status(201).json(newRecommendation);
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
