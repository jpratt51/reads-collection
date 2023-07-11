"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserBadges(req, res) {
    return res.send("Mock get all user's badges request");
});

router.get("/:badge_id", function getOneUserBadge(req, res) {
    return res.send("Mock get one user badge request");
});

router.post("/", function createUserBadge(req, res) {
    return res.send("Mock create user badge request");
});

module.exports = router;
