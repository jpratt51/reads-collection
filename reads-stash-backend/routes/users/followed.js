"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserFollowed = require("../../models/users/followed");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createUserFollowedSchema = require("../../schemas/createUserFollowed.json");
const ExpressError = require("../../expressError");

router.get(
    "/:userId/followed",
    ensureLoggedIn,
    async function getAllUserFollowed(req, res, next) {
        try {
            const { userId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Followed Users",
                    403
                );
                return next(invalidUser);
            }
            let followed = await UserFollowed.getAll(userId);
            return res.json(followed);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:userId/followed/:followedId",
    ensureLoggedIn,
    async function getOneUserFollowed(req, res, next) {
        try {
            const { userId, followedId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Followed Users",
                    403
                );
                return next(invalidUser);
            }
            let followed = await UserFollowed.getById(userId, followedId);
            return res.json(followed);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:userId/followed",
    ensureLoggedIn,
    async function createUserFollowed(req, res, next) {
        try {
            const { followedId, userId } = req.body;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Followed Users",
                    403
                );
                return next(invalidUser);
            }
            const validator = jsonschema.validate(
                req.body,
                createUserFollowedSchema
            );
            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
            const followed = await UserFollowed.create(followedId, userId);
            return res.status(201).json(followed);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:userId/followed/:followedId",
    ensureLoggedIn,
    async function deleteUserFollowed(req, res, next) {
        try {
            const { userId, followedId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Followed Users",
                    403
                );
                return next(invalidUser);
            }
            const followed = await UserFollowed.getById(userId, followedId);
            await followed.delete();
            return res.json({
                msg: `User ${userId} stopped following user ${followedId}`,
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
