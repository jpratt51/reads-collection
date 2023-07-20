"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserRead = require("../../models/users/read");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createUserReadSchema = require("../../schemas/createUserRead.json");
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
                const invalidUser = new ExpressError(
                    "Cannot Create Reads For Other Users",
                    403
                );
                return next(invalidUser);
            }
            const validator = jsonschema.validate(inputs, createUserReadSchema);
            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }

            const { rating, reviewText, reviewDate } = req.body;
            const validInputs = {};
            validInputs["user_id"] = userId;
            validInputs["read_id"] = readId;
            rating ? (validInputs["rating"] = rating) : null;
            reviewText ? (validInputs["review_text"] = reviewText) : null;
            reviewDate ? (validInputs["review_date"] = reviewDate) : null;
            const userRead = await UserRead.create(validInputs);
            return res.status(201).json(userRead);
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
