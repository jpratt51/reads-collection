"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get("/", function getAllUsers(req, res, next) {
    try {
        return res.status(200).json({ msg: "Dummy all users result" });
    } catch (error) {
        return next(error);
    }
});

router.get("/:user_id", function getOneUser(req, res, next) {
    try {
        return res.status(200).json({ msg: "Dummy one user result" });
    } catch (error) {
        return next(error);
    }
});

router.post("/", async function createUser(req, res, next) {
    try {
        const { username, fname, lname, email, password } = req.body;
        const results = await db.query(
            "INSERT INTO users (username, fname, lname, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [username, fname, lname, email, password]
        );
        return res.status(201).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

router.patch("/:user_id", function updateUser(req, res, next) {
    try {
        return res.status(200).json({ msg: "Dummy updated user result" });
    } catch (error) {
        return next(error);
    }
});

router.delete("/:user_id", function deleteUser(req, res, next) {
    try {
        return res.status(200).json({ msg: "Dummy deleted user result" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
