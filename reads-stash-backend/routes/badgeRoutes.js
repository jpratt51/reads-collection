"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");
const Badge = require("../models/badge");

router.get("/", async function getAllBadges(req, res, next) {
    try {
        let badges = await Badge.getAll();
        return res.status(200).json(badges);
    } catch (error) {
        return next(error);
    }
});

router.get("/:badgeId", async function getOneBadge(req, res, next) {
    try {
        const { badgeId } = req.params;
        const results = await db.query(`SELECT * FROM badges WHERE id = $1;`, [
            badgeId,
        ]);
        return res.status(200).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
