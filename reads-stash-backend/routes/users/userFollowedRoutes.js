"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserFollowed(req, res) {
    return res
        .status(200)
        .json({ msg: "Mock get all user's followed users request" });
});

router.get("/:followed_id", function getOneUserFollowed(req, res) {
    return res
        .status(200)
        .json({ msg: "Mock get one user followed user request" });
});

router.post("/", function createUserFollowed(req, res) {
    return res
        .status(201)
        .json({ msg: "Mock create user followed user request" });
});

router.delete("/:followed_id", function deleteUserFollowed(req, res) {
    return res
        .status(200)
        .json({ msg: "Mock delete user followed user request" });
});

module.exports = router;
