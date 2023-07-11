"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserReads(req, res) {
    return res.status(200).json({ msg: "Dummy get all user reads response" });
});

router.get("/:users_reads_id", function getOneUserRead(req, res) {
    return res.status(200).json({ msg: "Dummy get one user read response" });
});

router.post("/", function createUserRead(req, res) {
    return res.status(201).json({ msg: "Dummy created user read response" });
});

router.delete("/:collection_id", function deleteUserRead(req, res) {
    return res.status(200).json({ msg: "Dummy deleted user read response" });
});

module.exports = router;
