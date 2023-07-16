"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const { dataToSql } = require("../../helpers/sql.js");
const User = require("../../models/users/user");

router.get("/", async function getAllUsers(req, res, next) {
    try {
        let users = await User.getAll();
        return res.status(200).json(users);
    } catch (error) {
        return next(error);
    }
});

router.get("/:userId", async function getOneUser(req, res, next) {
    try {
        const { userId } = req.params;
        let user = await User.getById(userId);
        return res.status(200).json(user);
    } catch (error) {
        return next(error);
    }
});

router.post("/", async function createUser(req, res, next) {
    try {
        const { username, fname, lname, email, password } = req.body;
        const user = await User.create(username, fname, lname, email, password);
        return res.status(201).json(user);
    } catch (error) {
        return next(error);
    }
});

router.patch("/:userId", async function updateUser(req, res, next) {
    try {
        const { columns, values } = dataToSql(req.body);
        const { userId } = req.params;
        const results = await db.query(
            `UPDATE users SET ${columns}
            WHERE id=$${values.length + 1}
            RETURNING username, fname, lname, email`,
            [...values, userId]
        );
        return res.status(200).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

router.delete("/:userId", async function deleteUser(req, res, next) {
    try {
        const { userId } = req.params;
        const user = await User.getById(userId);
        await user.delete();
        return res.status(200).json({ msg: `Deleted user ${userId}` });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
