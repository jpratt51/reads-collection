"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get(
    "/:user_id/journals",
    async function getAllUserJournals(req, res, next) {
        try {
            const { user_id } = req.params;
            const results = await db.query(
                `SELECT * FROM journals WHERE user_id = ${user_id};`
            );
            return res.status(200).json(results.rows);
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
                `SELECT * FROM journals WHERE id = ${journal_id} AND user_id = ${user_id};`
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
    function updateUserJournal(req, res, next) {
        try {
            return res
                .status(200)
                .json({ msg: "Mock update user journal request" });
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:user_id/journals/:journal_id",
    function deleteUserJournal(req, res, next) {
        try {
            return res
                .status(200)
                .json({ msg: "Mock delete user journal request" });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
