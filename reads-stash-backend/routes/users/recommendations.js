"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserRecommendation = require("../../models/users/recommendation");
const { ensureLoggedIn } = require("../../middleware/auth");

router.get(
    "/:userId/recommendations",
    ensureLoggedIn,
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
    ensureLoggedIn,
    async function getOneUserRecommendation(req, res, next) {
        try {
            const { recommendationId, userId } = req.params;
            const recommendation = await UserRecommendation.getById(
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
    ensureLoggedIn,
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
    ensureLoggedIn,
    async function updateUserRecommendation(req, res, next) {
        try {
            const { userId, recommendationId } = req.params;
            const { recommendation } = req.body;
            const getRecommendation = await UserRecommendation.getById(
                recommendationId,
                userId
            );
            recommendation
                ? (getRecommendation.recommendation = recommendation)
                : null;
            await getRecommendation.update(userId);
            return res.status(200).json(getRecommendation);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:userId/recommendations/:recommendationId",
    ensureLoggedIn,
    async function deleteUserRecommendation(req, res, next) {
        try {
            const { userId, recommendationId } = req.params;
            const recommendation = await UserRecommendation.getById(
                recommendationId,
                userId
            );
            await recommendation.delete(userId);
            return res.status(200).json({
                msg: `Deleted user recommendation ${recommendationId}`,
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
