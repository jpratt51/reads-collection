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
            let userReads = await UserRead.getAll(userId);
            return res.status(200).json(userReads);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:userId/reads/:usersReadsId",
    ensureLoggedIn,
    async function getOneUserRead(req, res, next) {
        try {
            const { userId, usersReadsId } = req.params;
            const userRead = await UserRead.getById(userId, usersReadsId);
            return res.status(200).json(userRead);
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
            const validator = jsonschema.validate(
                req.body,
                createUserReadSchema
            );
            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }

            const userRead = await UserRead.create(userId, readId);
            return res.status(201).json(userRead);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:userId/reads/:usersReadsId",
    ensureLoggedIn,
    async function deleteUserRead(req, res, next) {
        try {
            const { userId, usersReadsId } = req.params;
            const read = await UserRead.getById(userId, usersReadsId);
            await read.delete(userId);
            return res
                .status(200)
                .json({ msg: `Deleted user read ${usersReadsId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
