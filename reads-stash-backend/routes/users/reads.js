"use strict";

const express = require("express");
const router = new express.Router();
const UserRead = require("../../models/users/read");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createUserReadSchema = require("../../schemas/createUserRead.json");
const updateUserReadSchema = require("../../schemas/updateUserRead.json");
const ExpressError = require("../../expressError");

router.get(
    "/:username/reads",
    ensureLoggedIn,
    async function getAllUserReads(req, res, next) {
        try {
            const { username } = req.params;
            const { title, author } = req.body;
            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Reads",
                    403
                );
                return next(invalidUser);
            }
            let userReads = await UserRead.getAll(username, title, author);
            return res.json(userReads);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:username/reads/:isbn",
    ensureLoggedIn,
    async function getOneUserRead(req, res, next) {
        try {
            const { username, isbn } = req.params;
            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Reads",
                    403
                );
                return next(invalidUser);
            }
            const userRead = await UserRead.getByIsbn(username, isbn);
            return res.json(userRead);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:username/reads",
    ensureLoggedIn,
    async function createUserRead(req, res, next) {
        try {
            const { username } = req.params;
            const { isbn } = req.body;
            const inputs = req.body;
            inputs["username"] = username;
            if (req.user.username != username) {
                const invalidUsernameError = new ExpressError(
                    "Cannot Create Reads For Other Users",
                    403
                );
                return next(invalidUsernameError);
            }
            const validator = jsonschema.validate(inputs, createUserReadSchema);

            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
            const userRead = await UserRead.create(username, isbn, inputs);
            return res.status(201).json(userRead);
        } catch (error) {
            return next(error);
        }
    }
);

router.patch(
    "/:username/reads/:isbn",
    ensureLoggedIn,
    async function updateUserRead(req, res, next) {
        try {
            const { username, isbn } = req.params;
            const inputs = req.body;
            inputs["username"] = username;
            inputs["isbn"] = isbn;
            if (req.user.username != username) {
                const invalidUsernameError = new ExpressError(
                    "Cannot Update Reads For Other Users",
                    403
                );
                return next(invalidUsernameError);
            }
            const validator = jsonschema.validate(inputs, updateUserReadSchema);

            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
            const userRead = await UserRead.update(username, isbn, inputs);
            return res.json(userRead);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:username/reads/:isbn",
    ensureLoggedIn,
    async function deleteUserRead(req, res, next) {
        try {
            const { username, isbn } = req.params;
            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot Delete Other User's Reads",
                    403
                );
                return next(invalidUser);
            }
            const read = await UserRead.getByIsbn(username, isbn);
            await read.delete(username);
            return res.json({ msg: `Deleted user read ${isbn}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
