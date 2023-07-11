"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserCollections(req, res) {
    return res.send("Mock get all user's collections request");
});

router.get("/:collection_id", function getOneUserCollection(req, res) {
    return res.send("Mock get one user collection request");
});

router.post("/", function createUserCollection(req, res) {
    return res.send("Mock create user collection request");
});

router.patch("/:collection_id", function updateUserCollection(req, res) {
    return res.send("Mock update user collection request");
});

router.delete("/:collection_id", function deleteUserCollection(req, res) {
    return res.send("Mock delete user collection request");
});

module.exports = router;
