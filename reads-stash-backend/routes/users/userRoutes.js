"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUsers(req, res) {
    return res.status(200).json({ msg: "Dummy all users result" });
});

router.get("/:user_id", function getOneUser(req, res) {
    return res.status(200).json({ msg: "Dummy one user result" });
});

router.post("/", function createUser(req, res) {
    return res.status(201).json({ msg: "Dummy created user result" });
});

router.patch("/:user_id", function updateUser(req, res) {
    return res.status(200).json({ msg: "Dummy updated user result" });
});

router.delete("/:user_id", function deleteUser(req, res) {
    return res.status(200).json({ msg: "Dummy deleted user result" });
});

module.exports = router;
