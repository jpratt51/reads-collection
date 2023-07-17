"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const { dataToSql } = require("../../helpers/sql.js");
const UserJournal = require("../../models/users/journal");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createUserJournalSchema = require("../../schemas/createUserJournal.json");
const ExpressError = require("../../expressError");

router.get(
    "/:userId/journals",
    ensureLoggedIn,
    async function getAllUserJournals(req, res, next) {
        try {
            const { userId } = req.params;
            let journals = await UserJournal.getAll(userId);
            return res.status(200).json(journals);
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
            let journal = await UserJournal.getById(userId, journalId);
            return res.status(200).json(journal);
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
            const { title, text, userId } = req.body;
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
            let date = new Date().toJSON().slice(0, 10);
            const { userId, journalId } = req.params;
            const inputs = req.body;
            const journal = await UserJournal.getById(userId, journalId);
            journal.date = date;
            inputs.title ? (journal.title = inputs.title) : null;
            inputs.text ? (journal.text = inputs.text) : null;
            await journal.update();
            return res.status(200).json(journal);
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
            const journal = await UserJournal.getById(userId, journalId);
            await journal.delete(userId);
            return res
                .status(200)
                .json({ msg: `Deleted journal ${journalId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
