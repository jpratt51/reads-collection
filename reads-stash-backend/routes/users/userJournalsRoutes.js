"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserJournals(req, res) {
    return res
        .status(200)
        .json({ msg: "Dummy get all user journals response" });
});

router.get("/:journal_id", function getOneUserJournal(req, res) {
    return res.status(200).json({ msg: "get one user journal response" });
});

router.post("/", function createUserJournal(req, res) {
    return res.status(201).json({ msg: "create user journal response" });
});

router.patch("/:journal_id", function updateUserJournal(req, res) {
    return res.status(200).json({ msg: "Mock update user journal request" });
});

router.delete("/:journal_id", function deleteUserJournal(req, res) {
    return res.status(200).json({ msg: "Mock delete user journal request" });
});

module.exports = router;
