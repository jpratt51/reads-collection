"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const { dataToSql } = require("../../helpers/sql.js");
const UserJournal = require("../../models/users/userJournal");

router.get(
    "/:userId/journals",
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
    async function getOneUserJournal(req, res, next) {
        try {
            const { userId, journalId } = req.params;
            const results = await db.query(
                `SELECT * FROM journals WHERE id = $1 AND user_id = $2;`,
                [journalId, userId]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:userId/journals",
    async function createUserJournal(req, res, next) {
        try {
            const { title, date, text, userId } = req.body;
            const results = await db.query(
                "INSERT INTO journals (title, date, text, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
                [title, date, text, userId]
            );
            return res.status(201).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.patch(
    "/:userId/journals/:journalId",
    async function updateUserJournal(req, res, next) {
        try {
            let date = new Date().toJSON().slice(0, 10);
            const { columns, values } = dataToSql(req.body);
            const { userId, journalId } = req.params;
            const results = await db.query(
                `UPDATE journals SET ${columns}, date = $${values.length + 1}
                WHERE id = $${values.length + 2} AND user_id = $${
                    values.length + 3
                }
                RETURNING *`,
                [...values, date, journalId, userId]
            );
            return res.status(200).send(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:userId/journals/:journalId",
    async function deleteUserJournal(req, res, next) {
        try {
            const { userId, journalId } = req.params;
            await db.query(
                "DELETE FROM journals WHERE id = $1 AND user_id = $2;",
                [journalId, userId]
            );
            return res
                .status(200)
                .json({ msg: `Deleted journal ${journalId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
