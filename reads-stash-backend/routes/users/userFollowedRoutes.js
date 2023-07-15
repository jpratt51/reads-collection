"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get(
    "/:userId/followed",
    async function getAllUserFollowed(req, res, next) {
        try {
            const { userId } = req.params;
            const results = await db.query(
                `SELECT * FROM users_followed WHERE user_id = $1;`,
                [userId]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:userId/followed/:followedId",
    async function getOneUserFollowed(req, res, next) {
        try {
            const { userId, followedId } = req.params;
            const results = await db.query(
                `SELECT * FROM users_followed WHERE id = $1 AND user_id = $2;`,
                [followedId, userId]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:userId/followed",
    async function createUserFollowed(req, res, next) {
        try {
            const { followedId, userId } = req.body;
            const results = await db.query(
                "INSERT INTO users_followed (followed_id, user_id) VALUES ($1, $2) RETURNING * ;",
                [followedId, userId]
            );
            return res.status(201).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:userId/followed/:followedId",
    async function deleteUserFollowed(req, res, next) {
        try {
            const { userId, followedId } = req.params;
            await db.query(
                "DELETE FROM users_followed WHERE followed_id = $1 AND user_id = $2;",
                [followedId, userId]
            );
            return res.status(200).json({
                msg: `User ${userId} stopped following user ${followedId}`,
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
