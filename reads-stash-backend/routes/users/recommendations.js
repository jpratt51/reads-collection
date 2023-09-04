"use strict";

const express = require("express");
const router = new express.Router();
const UserRecommendation = require("../../models/users/recommendation");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createRecommendationSchema = require("../../schemas/createRecommendation.json");
const updateRecommendationSchema = require("../../schemas/updateRecommendation.json");
const ExpressError = require("../../expressError");

router.get(
    "/:username/recommendations",
    ensureLoggedIn,
    async function getAllUserRecommendations(req, res, next) {
        try {
            const { username } = req.params;
            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Recommendations",
                    403
                );
                return next(invalidUser);
            }
            let recommendations = await UserRecommendation.getAll(username);
            return res.json(recommendations);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:username/recommendations/:recommendationId",
    ensureLoggedIn,
    async function getOneUserRecommendation(req, res, next) {
        try {
            const { recommendationId, username } = req.params;
            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Recommendations",
                    403
                );
                return next(invalidUser);
            }
            const recommendation = await UserRecommendation.getById(
                recommendationId,
                username
            );
            return res.json(recommendation);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:username/recommendations",
    ensureLoggedIn,
    async function createUserRecommendation(req, res, next) {
        try {
            const { recommendation, receiverUsername, senderUsername } =
                req.body;
            const { username } = req.params;
            if (req.user.username != username) {
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
                receiverUsername,
                senderUsername
            );
            return res.status(201).json(newRecommendation);
        } catch (error) {
            return next(error);
        }
    }
);

router.patch(
    "/:username/recommendations/:recommendationId",
    ensureLoggedIn,
    async function updateUserRecommendation(req, res, next) {
        try {
            const { username, recommendationId } = req.params;
            if (req.user.username != username) {
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
                username
            );
            recommendation
                ? (getRecommendation.recommendation = recommendation)
                : null;
            await getRecommendation.update(username);
            return res.json(getRecommendation);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:username/recommendations/:recommendationId",
    ensureLoggedIn,
    async function deleteUserRecommendation(req, res, next) {
        try {
            const { username, recommendationId } = req.params;
            if (req.user.username != username) {
                const invalidUser = new ExpressError("Invalid Username", 403);
                return next(invalidUser);
            }
            const recommendation = await UserRecommendation.getById(
                recommendationId,
                username
            );
            await recommendation.delete(username);
            return res.json({
                msg: `Deleted User Recommendation ${recommendationId}`,
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
