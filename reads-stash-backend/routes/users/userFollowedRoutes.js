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
                `SELECT * FROM users_followed WHERE user_id = $1;`,
                [user_id]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:user_id/followed/:followed_id",
    async function getOneUserFollowed(req, res, next) {
        try {
            const { user_id, followed_id } = req.params;
            const results = await db.query(
                `SELECT * FROM users_followed WHERE id = $1 AND user_id = $2;`,
                [followed_id, user_id]
            );
            return res.status(200).json(results.rows);
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
    async function deleteUserFollowed(req, res, next) {
        try {
            const { user_id, followed_id } = req.params;
            await db.query(
                "DELETE FROM users_followed WHERE followed_id = $1 AND user_id = $2;",
                [followed_id, user_id]
            );
            return res
                .status(200)
                .json({
                    msg: `User ${user_id} stopped following user ${followed_id}`,
                });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
