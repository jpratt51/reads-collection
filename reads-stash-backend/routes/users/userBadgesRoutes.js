"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get("/:user_id/badges", async function getAllUserBadges(req, res, next) {
    try {
        const { user_id } = req.params;
        const results = await db.query(
            `SELECT * FROM users_badges WHERE user_id = ${user_id};`
        );
        return res.status(200).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

router.get(
    "/:user_id/badges/:badge_id",
    async function getOneUserBadge(req, res, next) {
        try {
            const { user_id, badge_id } = req.params;
            const results = await db.query(
                `SELECT * FROM users_badges WHERE id = $1 AND user_id = $2;`,
                [badge_id, user_id]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.post("/:user_id/badges", async function createUserBadge(req, res, next) {
    try {
        const { user_id, badge_id } = req.body;
        const results = await db.query(
            "INSERT INTO users_badges (user_id, badge_id) VALUES ($1, $2) RETURNING * ;",
            [user_id, badge_id]
        );
        return res.status(201).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

router.delete(
    "/:user_id/badges/:users_badge_id",
    async function deleteUserBadge(req, res, next) {
        try {
            const { user_id, users_badge_id } = req.params;
            await db.query(
                "DELETE FROM users_badges WHERE id = $1 AND user_id = $2;",
                [users_badge_id, user_id]
            );
            return res
                .status(200)
                .json({ msg: `Deleted user's badge ${users_badge_id}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
