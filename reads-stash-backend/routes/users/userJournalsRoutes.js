"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get("/", function getAllUserJournals(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Dummy get all user journals response" });
    } catch (error) {
        return next(error);
    }
});

router.get("/:journal_id", function getOneUserJournal(req, res, next) {
    try {
        return res.status(200).json({ msg: "get one user journal response" });
    } catch (error) {
        return next(error);
    }
});

router.post("/", async function createUserJournal(req, res, next) {
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
});

router.patch("/:journal_id", function updateUserJournal(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock update user journal request" });
    } catch (error) {
        return next(error);
    }
});

router.delete("/:journal_id", function deleteUserJournal(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock delete user journal request" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
