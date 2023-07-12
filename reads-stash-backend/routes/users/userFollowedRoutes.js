"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get("/", function getAllUserFollowed(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock get all user's followed users request" });
    } catch (error) {
        return next(error);
    }
});

router.get("/:followed_id", function getOneUserFollowed(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock get one user followed user request" });
    } catch (error) {
        return next(error);
    }
});

router.post("/", async function createUserFollowed(req, res, next) {
    try {
        const { followed_id, user_id } = req.body;
        const results = await db.query(
            "INSERT INTO users_followed (followed_id, user_id) VALUES ($1, $2) RETURNING * ;",
            [followed_id, user_id]
        );
        return res.status(201).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

router.delete("/:followed_id", function deleteUserFollowed(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock delete user followed user request" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
