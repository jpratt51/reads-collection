"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserRecommendation = require("../../models/users/recommendation");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createRecommendationSchema = require("../../schemas/createRecommendation.json");
const updateRecommendationSchema = require("../../schemas/updateRecommendation.json");
const ExpressError = require("../../expressError");

router.get(
    "/:userId/recommendations",
    ensureLoggedIn,
    async function getAllUserRecommendations(req, res, next) {
        try {
            const { userId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Recommendations",
                    403
                );
                return next(invalidUser);
            }
            let recommendations = await UserRecommendation.getAll(userId);
            return res.json(recommendations);
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
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Recommendations",
                    403
                );
                return next(invalidUser);
            }
            const recommendation = await UserRecommendation.getById(
                recommendationId,
                userId
            );
            return res.json(recommendation);
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
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot Create Recommendations From Other Users",
                    403
                );
                return next(invalidUser);
            }
            const validator = jsonschema.validate(
                req.body,
                createRecommendationSchema
            );
            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
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
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot Update Recommendations From Other Users",
                    403
                );
                return next(invalidUser);
            }
            const { recommendation } = req.body;
            const validator = jsonschema.validate(
                req.body,
                updateRecommendationSchema
            );
            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
            const getRecommendation = await UserRecommendation.getById(
                recommendationId,
                userId
            );
            recommendation
                ? (getRecommendation.recommendation = recommendation)
                : null;
            await getRecommendation.update(userId);
            return res.json(getRecommendation);
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
            if (req.user.id != userId) {
                const invalidUser = new ExpressError("Invalid User ID", 403);
                return next(invalidUser);
            }
            const recommendation = await UserRecommendation.getById(
                recommendationId,
                userId
            );
            await recommendation.delete(userId);
            return res.json({
                msg: `Deleted user recommendation ${recommendationId}`,
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
