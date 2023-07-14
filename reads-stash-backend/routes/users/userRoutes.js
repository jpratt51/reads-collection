"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get("/", async function getAllUsers(req, res, next) {
    try {
        const results = await db.query("SELECT * FROM users;");
        return res.status(200).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

router.get("/:user_id", async function getOneUser(req, res, next) {
    try {
        const { user_id } = req.params;
        const results = await db.query("SELECT * FROM users WHERE id = $1", [
            user_id,
        ]);
        return res.status(200).json(results.rows);
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

router.delete("/:user_id", async function deleteUser(req, res, next) {
    try {
        const { user_id } = req.params;
        await db.query("DELETE FROM users WHERE id = $1", [user_id]);
        return res.status(200).json({ msg: `Deleted user ${user_id}` });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
