"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllReads(req, res) {
    return res.status(200).json({ msg: "Mock get all reads request" });
});

router.get("/:read_id", function getOneRead(req, res) {
    return res.status(200).json({ msg: "Mock get one read request" });
});

router.post("/", function createRead(req, res) {
    return res.status(201).json({ msg: "Mock create read request" });
});

module.exports = router;
