"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get(
    "/:user_id/followers",
    async function getAllUserFollowers(req, res, next) {
        try {
            const { user_id } = req.params;
            const results = await db.query(
                `SELECT * FROM users_followers WHERE user_id = $1;`,
                [user_id]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:user_id/followers/:follower_id",
    async function getOneUserFollower(req, res, next) {
        try {
            const { user_id, follower_id } = req.params;
            const results = await db.query(
                `SELECT * FROM users_followers WHERE id = $1 AND user_id = $2;`,
                [follower_id, user_id]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
