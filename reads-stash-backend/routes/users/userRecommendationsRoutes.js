"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get(
    "/:user_id/recommendations",
    async function getAllUserRecommendations(req, res, next) {
        try {
            const { user_id } = req.params;
            const results = await db.query(
                `SELECT * FROM recommendations WHERE receiver_id = $1 OR sender_id = $1;`,
                [user_id]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:user_id/recommendations/:recommendation_id",
    async function getOneUserRecommendation(req, res, next) {
        try {
            const { recommendation_id, user_id } = req.params;
            const results = await db.query(
                `SELECT * FROM recommendations WHERE id = $1 AND sender_id = $2 OR id = $1 AND receiver_id = $2;`,
                [recommendation_id, user_id]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:user_id/recommendations",
    async function createUserRecommendation(req, res, next) {
        try {
            const { recommendation, receiver_id, sender_id } = req.body;
            const results = await db.query(
                "INSERT INTO recommendations (recommendation, receiver_id, sender_id) VALUES ($1, $2, $3) RETURNING *",
                [recommendation, receiver_id, sender_id]
            );
            return res.status(201).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.patch(
    "/:user_id/recommendations/:recommendation_id",
    function updateUserRecommendation(req, res, next) {
        try {
            return res
                .status(200)
                .json({ msg: "Dummy updated user recommendation response" });
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:user_id/recommendations/:recommendation_id",
    function deleteUserRecommendation(req, res, next) {
        try {
            return res
                .status(200)
                .json({ msg: "Dummy deleted user recommendation response" });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
