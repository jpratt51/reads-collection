"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get(
    "/:userId/followers",
    async function getAllUserFollowers(req, res, next) {
        try {
            const { userId } = req.params;
            const results = await db.query(
                `SELECT * FROM users_followers WHERE user_id = $1;`,
                [userId]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:userId/followers/:followerId",
    async function getOneUserFollower(req, res, next) {
        try {
            const { userId, followerId } = req.params;
            const results = await db.query(
                `SELECT * FROM users_followers WHERE id = $1 AND user_id = $2;`,
                [followerId, userId]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
