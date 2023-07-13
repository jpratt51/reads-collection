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
                `SELECT * FROM users_followers WHERE user_id = ${user_id};`
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:user_id/followers/:follower_id",
    function getOneUserFollower(req, res, next) {
        try {
            return res
                .status(200)
                .json({ msg: "Mock get one user follower request" });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
