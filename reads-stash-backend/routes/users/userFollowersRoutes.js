"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserFollowers(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock get all user's followers request" });
    } catch (error) {
        return next(error);
    }
});

router.get("/:follower_id", function getOneUserFollower(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock get one user follower request" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
