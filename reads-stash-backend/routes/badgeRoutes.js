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

router.get("/:badge_id", function getOneBadge(req, res, next) {
    try {
        return res.status(200).json({ msg: "Mock get one badge request" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
