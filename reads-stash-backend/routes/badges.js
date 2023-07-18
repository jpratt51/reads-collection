"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");
const Badge = require("../models/badge");
const { ensureLoggedIn } = require("../middleware/auth");

router.get("/", ensureLoggedIn, async function getAllBadges(req, res, next) {
    try {
        let badges = await Badge.getAll();
        return res.json(badges);
    } catch (error) {
        return next(error);
    }
});

router.get(
    "/:badgeId",
    ensureLoggedIn,
    async function getOneBadge(req, res, next) {
        try {
            const { badgeId } = req.params;
            let badge = await Badge.getById(badgeId);
            return res.json(badge);
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
