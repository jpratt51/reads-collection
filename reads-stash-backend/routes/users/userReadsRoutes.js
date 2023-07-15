"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserRead = require("../../models/userRead");

router.get("/:userId/reads", async function getAllUserReads(req, res, next) {
    try {
        const { userId } = req.params;
        let userReads = await UserRead.getAll(userId);
        return res.status(200).json(userReads);
    } catch (error) {
        return next(error);
    }
});

router.get(
    "/:userId/reads/:usersReadsId",
    async function getOneUserRead(req, res, next) {
        try {
            const { userId, usersReadsId } = req.params;
            const results = await db.query(
                `SELECT * FROM users_reads WHERE id = $1 AND user_id = $2;`,
                [usersReadsId, userId]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.post("/:userId/reads", function createUserRead(req, res, next) {
    try {
        return res
            .status(201)
            .json({ msg: "Dummy created user read response" });
    } catch (error) {
        return next(error);
    }
});

router.delete(
    "/:userId/reads/:usersReadsId",
    async function deleteUserRead(req, res, next) {
        try {
            const { userId, usersReadsId } = req.params;
            await db.query(
                "DELETE FROM users_reads WHERE id = $1 AND user_id = $2;",
                [usersReadsId, userId]
            );
            return res
                .status(200)
                .json({ msg: `Deleted user read ${usersReadsId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
