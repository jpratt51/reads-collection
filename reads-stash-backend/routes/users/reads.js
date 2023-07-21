"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserRead = require("../../models/users/read");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createUserReadSchema = require("../../schemas/createUserRead.json");
const updateUserReadSchema = require("../../schemas/updateUserRead.json");
const ExpressError = require("../../expressError");

router.get(
    "/:userId/reads",
    ensureLoggedIn,
    async function getAllUserReads(req, res, next) {
        try {
            const { userId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Reads",
                    403
                );
                return next(invalidUser);
            }
            let userReads = await UserRead.getAll(userId);
            return res.json(userReads);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:userId/reads/:readId",
    ensureLoggedIn,
    async function getOneUserRead(req, res, next) {
        try {
            const { userId, readId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Reads",
                    403
                );
                return next(invalidUser);
            }
            const userRead = await UserRead.getById(userId, readId);
            return res.json(userRead);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:userId/reads",
    ensureLoggedIn,
    async function createUserRead(req, res, next) {
        try {
            const { userId } = req.params;
            const { readId } = req.body;
            const inputs = req.body;
            inputs["userId"] = +userId;
            if (req.user.id != userId) {
                const invalidUserIdError = new ExpressError(
                    "Cannot Create Reads For Other Users",
                    403
                );
                return next(invalidUserIdError);
            }
            const validator = jsonschema.validate(inputs, createUserReadSchema);

            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
            const userRead = await UserRead.create(userId, readId, inputs);
            return res.status(201).json(userRead);
        } catch (error) {
            return next(error);
        }
    }
);

router.patch(
    "/:userId/reads/:readId",
    ensureLoggedIn,
    async function updateUserRead(req, res, next) {
        try {
            const { userId, readId } = req.params;
            const inputs = req.body;
            inputs["userId"] = +userId;
            inputs["readId"] = +readId;
            if (req.user.id != userId) {
                const invalidUserIdError = new ExpressError(
                    "Cannot Update Reads For Other Users",
                    403
                );
                return next(invalidUserIdError);
            }
            const validator = jsonschema.validate(inputs, updateUserReadSchema);

            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }

            const userRead = await UserRead.update(userId, readId, inputs);
            console.log("userRead", userRead);
            return res.json(userRead);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:userId/reads/:readId",
    ensureLoggedIn,
    async function deleteUserRead(req, res, next) {
        try {
            const { userId, readId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot Delete Other User's Reads",
                    403
                );
                return next(invalidUser);
            }
            const read = await UserRead.getById(userId, readId);
            await read.delete(userId);
            return res.json({ msg: `Deleted user read ${readId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
