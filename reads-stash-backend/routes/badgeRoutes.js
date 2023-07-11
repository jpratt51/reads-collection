"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllBadges(req, res) {
    return res.status(200).json({ msg: "Mock get all badges request" });
});

router.get("/:badge_id", function getOneBadge(req, res) {
    return res.status(200).json({ msg: "Mock get one badge request" });
});

module.exports = router;
