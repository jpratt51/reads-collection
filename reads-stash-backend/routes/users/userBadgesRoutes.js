"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserBadges(req, res) {
    return res.status(200).json({ msg: "Mock get all user's badges request" });
});

router.get("/:badge_id", function getOneUserBadge(req, res) {
    return res.status(200).json({ msg: "Mock get one user badge request" });
});

router.post("/", function createUserBadge(req, res) {
    return res.status(201).json({ msg: "Mock create user badge request" });
});

router.delete("/:badge_id", function deleteUserBadge(req, res) {
    return res.status(200).json({ msg: "Mock delete user badge request" });
});

module.exports = router;
