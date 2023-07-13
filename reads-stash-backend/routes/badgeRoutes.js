"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");

router.get("/", async function getAllBadges(req, res, next) {
    try {
        const results = await db.query("SELECT * FROM badges;");
        return res.status(200).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

router.get("/:badge_id", async function getOneBadge(req, res, next) {
    try {
        const { badge_id } = req.params;
        const results = await db.query(
            `SELECT * FROM badges WHERE id = ${badge_id};`
        );
        return res.status(200).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
