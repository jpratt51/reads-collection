"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserFollowed(req, res) {
    return res.send("Mock get all user's followed users request");
});

router.get("/:followed_id", function getOneUserFollowed(req, res) {
    return res.send("Mock get one user followed user request");
});

router.post("/", function createUserFollowed(req, res) {
    return res.send("Mock create user followed user request");
});

router.delete("/:followed_id", function deleteUserFollowed(req, res) {
    return res.send("Mock delete user followed user request");
});

module.exports = router;
