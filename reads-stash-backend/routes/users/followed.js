"use strict";

const express = require("express");
const router = new express.Router();
const UserFollowed = require("../../models/users/followed");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createUserFollowedSchema = require("../../schemas/createUserFollowed.json");
const ExpressError = require("../../expressError");

router.get(
    "/:username/followed",
    ensureLoggedIn,
    async function getAllUserFollowed(req, res, next) {
        try {
            const { username } = req.params;
            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Followed Users",
                    403
                );
                return next(invalidUser);
            }
            let followed = await UserFollowed.getAll(username);
            return res.json(followed);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:username/followed/:followedUsername",
    ensureLoggedIn,
    async function getOneUserFollowed(req, res, next) {
        try {
            const { username, followedUsername } = req.params;
            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Followed Users",
                    403
                );
                return next(invalidUser);
            }
            let followed = await UserFollowed.getByUsername(
                username,
                followedUsername
            );
            return res.json(followed);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:username/followed",
    ensureLoggedIn,
    async function createUserFollowed(req, res, next) {
        try {
            const { followedUsername } = req.body;
            const { username } = req.params;
            let inputs = {};
            inputs["followedUsername"] = followedUsername;
            inputs["username"] = username;

            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Followed Users",
                    403
                );
                return next(invalidUser);
            }
            const validator = jsonschema.validate(
                inputs,
                createUserFollowedSchema
            );

            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
            const followed = await UserFollowed.create(
                followedUsername,
                username
            );

            return res.status(201).json(followed);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:username/followed/:followedUsername",
    ensureLoggedIn,
    async function deleteUserFollowed(req, res, next) {
        try {
            const { username, followedUsername } = req.params;
            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Followed Users",
                    403
                );
                return next(invalidUser);
            }
            const followed = await UserFollowed.getByUsername(
                username,
                followedUsername
            );
            await followed.delete();
            return res.json({
                msg: `User ${username} Stopped Following User ${followedUsername}`,
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
