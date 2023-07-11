"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUsers(req, res) {
    return res.send("Mock get all users request");
});

router.get("/:user_id", function getOneUser(req, res) {
    return res.send("Mock get one user request");
});

router.post("/", function createUser(req, res) {
    return res.send("Mock create user request");
});

router.patch("/:user_id", function updateUser(req, res) {
    return res.send("Mock update user request");
});

router.delete("/:user_id", function deleteUser(req, res) {
    return res.send("Mock delete user request");
});

module.exports = router;
