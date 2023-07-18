"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserJournal = require("../../models/users/journal");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createUserJournalSchema = require("../../schemas/createUserJournal.json");
const updateUserJournalSchema = require("../../schemas/updateUserJournal.json");
const ExpressError = require("../../expressError");

router.get(
    "/:userId/journals",
    ensureLoggedIn,
    async function getAllUserJournals(req, res, next) {
        try {
            const { userId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other Users Journals",
                    403
                );
                return next(invalidUser);
            }
            let journals = await UserJournal.getAll(userId);
            return res.json(journals);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:userId/journals/:journalId",
    ensureLoggedIn,
    async function getOneUserJournal(req, res, next) {
        try {
            const { userId, journalId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Reads",
                    403
                );
                return next(invalidUser);
            }
            let journal = await UserJournal.getById(userId, journalId);
            return res.json(journal);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:userId/journals",
    ensureLoggedIn,
    async function createUserJournal(req, res, next) {
        try {
            const { title, text, userId } = req.body;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot Create Journals For Other Users",
                    403
                );
                return next(invalidUser);
            }
            const validator = jsonschema.validate(
                req.body,
                createUserJournalSchema
            );
            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
            const date = new Date().toJSON().slice(0, 10);
            const journal = await UserJournal.create(title, date, text, userId);
            return res.status(201).json(journal);
        } catch (error) {
            return next(error);
        }
    }
);

router.patch(
    "/:userId/journals/:journalId",
    ensureLoggedIn,
    async function updateUserJournal(req, res, next) {
        try {
            const { userId, journalId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot Update Other User's Journals",
                    403
                );
                return next(invalidUser);
            }
            const validator = jsonschema.validate(
                req.body,
                updateUserJournalSchema
            );
            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
            let date = new Date().toJSON().slice(0, 10);
            const inputs = req.body;
            const journal = await UserJournal.getById(userId, journalId);
            journal.date = date;
            inputs.title ? (journal.title = inputs.title) : null;
            inputs.text ? (journal.text = inputs.text) : null;
            await journal.update();
            return res.json(journal);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:userId/journals/:journalId",
    ensureLoggedIn,
    async function deleteUserJournal(req, res, next) {
        try {
            const { userId, journalId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot Delete Other User's Journals",
                    403
                );
                return next(invalidUser);
            }
            const journal = await UserJournal.getById(userId, journalId);
            await journal.delete(userId);
            return res.json({ msg: `Deleted journal ${journalId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
