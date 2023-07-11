"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserReads(req, res) {
    return res.send("Mock get all user's reads request");
});

router.get("/:users_reads_id", function getOneUserRead(req, res) {
    return res.send("Mock get one user read request");
});

router.post("/", function createUserRead(req, res) {
    return res.send("Mock create user read request");
});

router.delete("/:collection_id", function deleteUserRead(req, res) {
    return res.send("Mock delete user collection request");
});

module.exports = router;
