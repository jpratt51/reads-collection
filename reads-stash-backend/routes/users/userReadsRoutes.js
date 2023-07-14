"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get("/:user_id/reads", async function getAllUserReads(req, res, next) {
    try {
        const { user_id } = req.params;
        const results = await db.query(
            `SELECT * FROM users_reads WHERE user_id = $1;`,
            [user_id]
        );
        return res.status(200).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

router.get(
    "/:user_id/reads/:users_reads_id",
    async function getOneUserRead(req, res, next) {
        try {
            const { user_id, users_reads_id } = req.params;
            const results = await db.query(
                `SELECT * FROM users_reads WHERE id = $1 AND user_id = $2;`,
                [users_reads_id, user_id]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.post("/:user_id/reads", function createUserRead(req, res, next) {
    try {
        return res
            .status(201)
            .json({ msg: "Dummy created user read response" });
    } catch (error) {
        return next(error);
    }
});

router.delete(
    "/:user_id/reads/:users_reads_id",
    async function deleteUserRead(req, res, next) {
        try {
            const { user_id, users_reads_id } = req.params;
            await db.query(
                "DELETE FROM users_reads WHERE id = $1 AND user_id = $2;",
                [users_reads_id, user_id]
            );
            return res
                .status(200)
                .json({ msg: `Deleted user read ${users_reads_id}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
