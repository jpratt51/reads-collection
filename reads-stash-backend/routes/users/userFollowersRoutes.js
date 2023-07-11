"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserFollowers(req, res) {
    return res
        .status(200)
        .json({ msg: "Mock get all user's followers request" });
});

router.get("/:follower_id", function getOneUserFollower(req, res) {
    return res.status(200).json({ msg: "Mock get one user follower request" });
});

module.exports = router;
