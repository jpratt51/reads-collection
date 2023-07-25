"use strict";

const express = require("express");
const router = new express.Router();
const UserBadge = require("../../models/users/badge");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createUserBadgeSchema = require("../../schemas/createUserBadge.json");
const ExpressError = require("../../expressError");

router.get(
    "/:userId/badges",
    ensureLoggedIn,
    async function getAllUserBadges(req, res, next) {
        try {
            const { userId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Badges",
                    403
                );
                return next(invalidUser);
            }
            const userBadges = await UserBadge.getAll(userId);
            return res.json(userBadges);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:userId/badges/:badgeId",
    ensureLoggedIn,
    async function getOneUserBadge(req, res, next) {
        try {
            const { userId, badgeId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Badges",
                    403
                );
                return next(invalidUser);
            }
            const userBadge = await UserBadge.getById(userId, badgeId);
            return res.json(userBadge);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:userId/badges",
    ensureLoggedIn,
    async function createUserBadge(req, res, next) {
        try {
            const { badgeId } = req.body;
            const { userId } = req.params;
            let inputs = {};
            inputs["badgeId"] = badgeId;
            inputs["userId"] = userId;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot Create Badges For Other Users",
                    403
                );
                return next(invalidUser);
            }
            const validator = jsonschema.validate(
                inputs,
                createUserBadgeSchema
            );
            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
            const badge = await UserBadge.create(userId, badgeId);
            return res.status(201).json(badge);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:userId/badges/:userBadgeId",
    ensureLoggedIn,
    async function deleteUserBadge(req, res, next) {
        try {
            const { userId, userBadgeId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot Delete Other User's Badges",
                    403
                );
                return next(invalidUser);
            }
            const userBadge = await UserBadge.getById(userId, userBadgeId);
            await userBadge.delete(userId);
            return res.json({ msg: `Deleted user's badge ${userBadgeId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
