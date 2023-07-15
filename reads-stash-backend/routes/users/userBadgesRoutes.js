"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get("/:userId/badges", async function getAllUserBadges(req, res, next) {
    try {
        const { userId } = req.params;
        const results = await db.query(
            `SELECT * FROM users_badges WHERE user_id = ${userId};`
        );
        return res.status(200).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

router.get(
    "/:userId/badges/:badgeId",
    async function getOneUserBadge(req, res, next) {
        try {
            const { userId, badgeId } = req.params;
            const results = await db.query(
                `SELECT * FROM users_badges WHERE id = $1 AND user_id = $2;`,
                [badgeId, userId]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.post("/:userId/badges", async function createUserBadge(req, res, next) {
    try {
        const { userId, badgeId } = req.body;
        const results = await db.query(
            "INSERT INTO users_badges (user_id, badge_id) VALUES ($1, $2) RETURNING * ;",
            [userId, badgeId]
        );
        return res.status(201).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

router.delete(
    "/:userId/badges/:users_badgeId",
    async function deleteUserBadge(req, res, next) {
        try {
            const { userId, usersBadgeId } = req.params;
            await db.query(
                "DELETE FROM users_badges WHERE id = $1 AND user_id = $2;",
                [usersBadgeId, userId]
            );
            return res
                .status(200)
                .json({ msg: `Deleted user's badge ${usersBadgeId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
