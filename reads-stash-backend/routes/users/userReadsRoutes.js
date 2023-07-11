"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserReads(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Dummy get all user reads response" });
    } catch (error) {
        return next(error);
    }
});

router.get("/:users_reads_id", function getOneUserRead(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Dummy get one user read response" });
    } catch (error) {
        return next(error);
    }
});

router.post("/", function createUserRead(req, res, next) {
    try {
        return res
            .status(201)
            .json({ msg: "Dummy created user read response" });
    } catch (error) {
        return next(error);
    }
});

router.delete("/:collection_id", function deleteUserRead(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Dummy deleted user read response" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
