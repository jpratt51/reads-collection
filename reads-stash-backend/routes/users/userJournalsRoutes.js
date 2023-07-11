"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserJournals(req, res) {
    return res.send("Mock get all user's journals request");
});

router.get("/:journal_id", function getOneUserJournal(req, res) {
    return res.send("Mock get one user collection request");
});

router.post("/", function createUserJournal(req, res) {
    return res.send("Mock create user journal request");
});

router.patch("/:journal_id", function updateUserJournal(req, res) {
    return res.send("Mock update user journal request");
});

router.delete("/:journal_id", function deleteUserJournal(req, res) {
    return res.send("Mock delete user journal request");
});

module.exports = router;
