"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get(
    "/:user_id/followed",
    async function getAllUserFollowed(req, res, next) {
        try {
            const { user_id } = req.params;
            const results = await db.query(
                `SELECT * FROM users_followed WHERE user_id = ${user_id};`
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:user_id/followed/:followed_id",
    function getOneUserFollowed(req, res, next) {
        try {
            return res
                .status(200)
                .json({ msg: "Mock get one user followed user request" });
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:user_id/followed",
    async function createUserFollowed(req, res, next) {
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
    }
);

router.delete(
    "/:user_id/followed/:followed_id",
    function deleteUserFollowed(req, res, next) {
        try {
            return res
                .status(200)
                .json({ msg: "Mock delete user followed user request" });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
