"use strict";

const express = require("express");
const router = new express.Router();
const UserBadge = require("../../models/users/badge");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createUserBadgeSchema = require("../../schemas/createUserBadge.json");
const ExpressError = require("../../expressError");

router.get(
    "/:username/badges",
    ensureLoggedIn,
    async function getAllUserBadges(req, res, next) {
        try {
            const { username } = req.params;
            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Badges",
                    403
                );
                return next(invalidUser);
            }
            const userBadges = await UserBadge.getAll(username);
            return res.json(userBadges);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:username/badges/:name",
    ensureLoggedIn,
    async function getOneUserBadge(req, res, next) {
        try {
            const { username, name } = req.params;
            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Badges",
                    403
                );
                return next(invalidUser);
            }
            const userBadge = await UserBadge.getByName(username, name);
            return res.json(userBadge);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:username/badges",
    ensureLoggedIn,
    async function createUserBadge(req, res, next) {
        try {
            const { name } = req.body;
            const { username } = req.params;
            let inputs = {};
            inputs["name"] = name;
            inputs["user_username"] = username;
            if (req.user.username != username) {
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
            const badge = await UserBadge.create(username, name);
            return res.status(201).json(badge);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:username/badges/:name",
    ensureLoggedIn,
    async function deleteUserBadge(req, res, next) {
        try {
            const { username, name } = req.params;
            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot Delete Other User's Badges",
                    403
                );
                return next(invalidUser);
            }
            const userBadge = await UserBadge.getByName(username, name);
            await userBadge.delete(username);
            return res.json({ msg: `Deleted User's Badge ${name}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
