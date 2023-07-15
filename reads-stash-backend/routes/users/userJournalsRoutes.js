"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const { dataToSql } = require("../../helpers/sql.js");
const UserJournal = require("../../models/userJournal");

router.get(
    "/:user_id/journals",
    async function getAllUserJournals(req, res, next) {
        try {
            const { user_id } = req.params;
            let journals = await UserJournal.getAll(user_id);
            return res.status(200).json(journals);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:user_id/journals/:journal_id",
    async function getOneUserJournal(req, res, next) {
        try {
            const { user_id, journal_id } = req.params;
            const results = await db.query(
                `SELECT * FROM journals WHERE id = $1 AND user_id = $2;`,
                [journal_id, user_id]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:user_id/journals",
    async function createUserJournal(req, res, next) {
        try {
            const { title, date, text, user_id } = req.body;
            const results = await db.query(
                "INSERT INTO journals (title, date, text, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
                [title, date, text, user_id]
            );
            return res.status(201).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.patch(
    "/:user_id/journals/:journal_id",
    async function updateUserJournal(req, res, next) {
        try {
            let date = new Date().toJSON().slice(0, 10);
            const { columns, values } = dataToSql(req.body);
            const { user_id, journal_id } = req.params;
            const results = await db.query(
                `UPDATE journals SET ${columns}, date = $${values.length + 1}
                WHERE id = $${values.length + 2} AND user_id = $${
                    values.length + 3
                }
                RETURNING *`,
                [...values, date, journal_id, user_id]
            );
            return res.status(200).send(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:user_id/journals/:journal_id",
    async function deleteUserJournal(req, res, next) {
        try {
            const { user_id, journal_id } = req.params;
            await db.query(
                "DELETE FROM journals WHERE id = $1 AND user_id = $2;",
                [journal_id, user_id]
            );
            return res
                .status(200)
                .json({ msg: `Deleted journal ${journal_id}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
