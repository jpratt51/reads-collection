"use strict";

const express = require("express");
const router = new express.Router();
const User = require("../../models/users/user");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const updateUserSchema = require("../../schemas/updateUser.json");
const ExpressError = require("../../expressError");

router.get("/", ensureLoggedIn, async function getAllUsers(req, res, next) {
    try {
        let users = await User.getAll();
        return res.json(users);
    } catch (error) {
        return next(error);
    }
});

router.get(
    "/:username",
    ensureLoggedIn,
    async function getOneUser(req, res, next) {
        try {
            const { username } = req.params;
            let user = await User.getByUsername(username);
            return res.json(user);
        } catch (error) {
            return next(error);
        }
    }
);

router.patch(
    "/:userId",
    ensureLoggedIn,
    async function updateUser(req, res, next) {
        try {
            const { userId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot Update Other Users",
                    403
                );
                return next(invalidUser);
            }
            const inputs = req.body;
            const validator = jsonschema.validate(inputs, updateUserSchema);
            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
            const user = await User.getById(userId);
            inputs.username ? (user.username = inputs.username) : null;
            inputs.fname ? (user.fname = inputs.fname) : null;
            inputs.lname ? (user.lname = inputs.lname) : null;
            inputs.email ? (user.email = inputs.email) : null;
            inputs.exp ? (user.exp = +inputs.exp) : null;
            inputs.totalBooks ? (user.totalBooks = +inputs.totalBooks) : null;
            inputs.totalPages ? (user.totalPages = +inputs.totalPages) : null;
            await user.update();
            return res.json(user);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:userId",
    ensureLoggedIn,
    async function deleteUser(req, res, next) {
        try {
            const { userId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot Delete Other Users",
                    403
                );
                return next(invalidUser);
            }
            const user = await User.getById(userId);
            await user.delete();
            return res.json({ msg: `Deleted user ${userId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
