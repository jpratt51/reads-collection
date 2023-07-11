"use strict";

const express = require("express");
const router = new express.Router();

router.post("/", function createReadAuthor(req, res) {
    return res.status(201).json({ msg: "Mock create read author request" });
});

module.exports = router;
