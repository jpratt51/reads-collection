"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserFollowed(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock get all user's followed users request" });
    } catch (error) {
        return next(error);
    }
});

router.get("/:followed_id", function getOneUserFollowed(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock get one user followed user request" });
    } catch (error) {
        return next(error);
    }
});

router.post("/", function createUserFollowed(req, res, next) {
    try {
        return res
            .status(201)
            .json({ msg: "Mock create user followed user request" });
    } catch (error) {
        return next(error);
    }
});

router.delete("/:followed_id", function deleteUserFollowed(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock delete user followed user request" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;